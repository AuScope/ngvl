import { CSWRecordModel, OlMapObject, OlMapService } from 'portal-core-ui';
import { OnInit, AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import Overlay from 'ol/Overlay';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import ImageWMS from 'ol/source/ImageWMS';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import * as Extent from 'ol/extent';
import * as Proj from 'ol/proj';

import { BoundaryService } from '../../../../shared/services/boundary.service';
import { environment } from '../../../../../environments/environment';

import { ConfirmDatasetsModalComponent } from '../../confirm-datasets.modal.component';
import { OlMapDataSelectComponent } from './olmap.select.data.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-ol-boundary-select',
    templateUrl: './olmap.boundaries.component.html',
    styleUrls: ['./olmap.boundaries.component.scss']
})

export class OlMapBoundariesComponent implements OnInit, AfterViewInit {

    @ViewChild('popupContent') popupContent: ElementRef;
    @ViewChild('popupElement') popupElement: ElementRef;
    @ViewChild('popupCloser') popupCloser: ElementRef;
    @ViewChild('popupFooter') popupFooter: ElementRef;

    boundaryLayer: ImageLayer;
    boundaryLayerSource: ImageWMS;
    overlay: Overlay; // popup
    highlightLayer: VectorLayer;  // highlighted polygon
    boundaryLayers;
    boundaryLayerMapping = {};

    searchResults: any[] = [];
    searchRegionField = new FormControl();

    constructor(public olMapObject: OlMapObject,
        public olMapService: OlMapService,
        public boundaryService: BoundaryService,
        private modalService: NgbModal) {
        if (environment.boundaryLayers === undefined) {
            this.boundaryLayers = [];
        } else {
            this.boundaryLayers = environment.boundaryLayers;
        }
        for (let i = 0; i < this.boundaryLayers.length; i++) {
            const layer = this.boundaryLayers[i];
            this.boundaryLayerMapping[layer.name] = layer;
        }
    }

    ngOnInit() {
        this.searchRegionField.disable();
        this.searchRegionField.valueChanges
            .debounceTime(200)
            .distinctUntilChanged()
            .subscribe(queryField => {
                if (this.boundaryLayer.getVisible && queryField != null && queryField.length > 0) {
                    const layer = this.boundaryLayerMapping[this.boundaryLayer.get('name')];
                    this.boundaryService.findFeatures(queryField, layer.name, layer.nameAttribute)
                        .subscribe(features => {
                            this.searchResults = [];
                            for (let i = 0; i < features.length; i++) {
                                const properties = features[i].getProperties();
                                this.searchResults.push({ 'id': features[i].getId(), 'name': properties[layer.nameAttribute] });
                            }
                        });
                } else {
                    this.searchResults = [];
                }
            });
    }


    ngAfterViewInit() {
        const map = this.olMapObject.getMap();
        this.boundaryLayerSource = new ImageWMS({
            ratio: 1,
            url: environment.boundariesUrl + '/wms',
            params: {
                'FORMAT': 'image/png',
                // 'FORMAT_OPTIONS': 'antialias:none',
                'VERSION': '1.3.0',
            },
            projection: map.getView().getProjection()
        });

        // not sure if tiled or untiled is better!
        this.boundaryLayer = new ImageLayer({
            source: this.boundaryLayerSource
        });
        // const tiled = new Tile({
        //     source: new TileWMS({
        //         url: environment.boundariesUrl + '/wms',
        //         params: {
        //             'FORMAT': 'image/png',
        //             // 'FORMAT_OPTIONS': 'antialias:none',
        //             'VERSION': '1.3.0',
        //             tiled: true,
        //             tilesOrigin: 96.81694139400008 + ',' + -43.740509602999964,
        //         },
        //         projection: map.getView().getProjection()
        //     })
        // });

        this.boundaryLayer.setZIndex(90);
        this.boundaryLayer.setVisible(false);
        this.boundaryLayer.set('name', undefined);

        // create an overlay for the popup window
        this.overlay = new Overlay({
            element: this.popupElement.nativeElement,
            autoPan: true
        });
        map.addOverlay(this.overlay);

        // create layer for highlighting selected boundary
        const polyStyle = new Style({
            stroke: new Stroke({
                color: 'rgb(255, 229, 38)', // yellow
                width: 3
            }),
            fill: new Fill({
                color: 'rgba(255, 229, 38, 0.25)' // transparent yellow
            })
        });
        this.highlightLayer = new VectorLayer({
            source: undefined,
            style: [polyStyle]
        });
        this.highlightLayer.setZIndex(100);  // always on top of other layers
        map.addLayer(this.highlightLayer);


        // make local copies of "this" variable, since can't seem to reference "this" inside event handlers
        const me = this;

        // add a click handler to hide the popup
        // returns false -> Don't follow the href
        this.popupCloser.nativeElement.onclick = function () {
            me.overlay.setPosition(undefined);
            return false;
        };

        // register click handler
        this.olMapObject.registerClickHandler(this.handleClick.bind(this));

        // bind selectData handler
        this.selectData.bind(this);

        this.clearSearchResults();
    }

    public handleClick(p: [number, number]) {
        // Convert pixel coords to map coords
        const map = this.olMapObject.getMap();
        const clickCoord = map.getCoordinateFromPixel(p);

        this.clearSearchResults();
        if (!this.boundaryLayer.getVisible()) { return; }
        const view = map.getView();
        const viewResolution = view.getResolution();
        const source = this.boundaryLayerSource;
        const url = source.getGetFeatureInfoUrl(clickCoord, viewResolution, view.getProjection(), { 'INFO_FORMAT': 'application/json' });
        this.boundaryService.getFeatures(url).subscribe(features => {
            // highlight it on the map and show info popup
            if (features.length > 0) {
                const layer = this.boundaryLayerMapping[this.boundaryLayer.get('name')];
                const properties = features[0].getProperties();
                let html = 'Name: ' + properties[layer.nameAttribute] + '<br>';
                html += 'Area: ' + (Math.round(properties[layer.areaAttribute] * 100.0) / 100.0).toFixed(2) + ' km<sup>2</sup><br>';
                this.popupContent.nativeElement.innerHTML = html;

                this.overlay.setPosition(clickCoord);
                const highlightSource = new VectorSource({
                    features: features
                });
                this.highlightLayer.setSource(highlightSource);

                // see if there are any csw records within this extent, if there are then display the "Select Data" link, otherwise hide it
                const cswRecords: CSWRecordModel[] = this.olMapService.getCSWRecordsForExtent(highlightSource.getExtent());
                if (cswRecords.length > 0) {
                    this.popupFooter.nativeElement.style.display = 'inline';
                } else {
                    this.popupFooter.nativeElement.style.display = 'none';
                }

            } else {
                this.overlay.setPosition(undefined);
                this.highlightLayer.setSource(undefined);
            }
        });
    }

    public selectData(): boolean {
        let extent = this.highlightLayer.getSource().getExtent();

        // close popup
        this.overlay.setPosition(undefined);

        // get csw records within this extent
        const cswRecords: CSWRecordModel[] = this.olMapService.getCSWRecordsForExtent(extent);

        // Get 4326 projection
        extent = Proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');

        // Display confirm datasets modal
        if (cswRecords.length > 0) {
            const modelRef = this.modalService.open(ConfirmDatasetsModalComponent, { size: 'lg' });
            modelRef.componentInstance.cswRecordTreeData = OlMapDataSelectComponent.buildTreeData(cswRecords, extent);
        }

        return false;
    }

    public clearSearchResults(): void {
        this.searchResults = [];
        this.searchRegionField.setValue('');
    }

    public getSLDBody(layerName: string, fillColour: string, fillOpacity: number, strokeColour: string, strokeWidth: number): string {
        return '<StyledLayerDescriptor version=\"1.0.0\" ><NamedLayer><Name>' + layerName + '</Name><UserStyle><Title></Title>'
            + '<FeatureTypeStyle><Rule><PolygonSymbolizer>'
            + '<Fill><CssParameter name=\"fill\">' + fillColour + '</CssParameter><CssParameter name=\"fill-opacity\">' + fillOpacity + '</CssParameter></Fill>'
            + '<Stroke><CssParameter name=\"stroke\">' + strokeColour + '</CssParameter><CssParameter name=\"stroke-width\">' + strokeWidth + '</CssParameter></Stroke>'
            + '</PolygonSymbolizer></Rule></FeatureTypeStyle>'
            + '</UserStyle></NamedLayer></StyledLayerDescriptor>';
    }

    public getColour(layerName): string {
        const layer = this.boundaryLayerMapping[layerName];
        if (layer != null) {
            return layer.colour;
        }
        return '#000000'; // return black by default
    }

    public onChange(event): void {
        const map = this.olMapObject.getMap();
        // get selected option
        for (let i = 0; i < event.srcElement.options.length; i++) {
            if (event.srcElement.options[i].selected) {
                const selectedOption = event.srcElement.options[i].value;
                if (selectedOption === 'NONE') {
                    map.removeLayer(this.boundaryLayer);
                    this.boundaryLayer.setVisible(false);
                    this.boundaryLayer.set('name', undefined);
                    this.searchRegionField.disable();
                } else {
                    const colour = this.getColour(selectedOption);
                    const sld = this.getSLDBody(selectedOption, colour, 0.0, colour, 0.5);
                    this.boundaryLayerSource.updateParams({ 'LAYERS': selectedOption, 'SLD_BODY': sld });
                    this.boundaryLayer.set('name', selectedOption);
                    if (!this.boundaryLayer.getVisible()) {
                        map.addLayer(this.boundaryLayer);
                        this.boundaryLayer.setVisible(true);
                    }
                    this.searchRegionField.enable();
                }
                break;
            }
        }
        // remove any popups, highlited polygons or search results
        this.overlay.setPosition(undefined);
        this.highlightLayer.setSource(undefined);
        this.clearSearchResults();
    }

    public onClick(event): void {
        this.boundaryService.getFeaturesById(event.srcElement.id, this.boundaryLayer.get('name')).subscribe(features => {
            // highlight it on the map and show info popup
            this.clearSearchResults();
            if (features.length > 0 && features[0].getGeometry() != null) {
                const feature = features[0];
                const geom = feature.getGeometry();
                const ext = geom.getExtent();
                const point = Extent.getCenter(ext);
                const map = this.olMapObject.getMap();

                const layer = this.boundaryLayerMapping[this.boundaryLayer.get('name')];
                const properties = feature.getProperties();
                let html = 'Name: ' + properties[layer.nameAttribute] + '<br>';
                html += 'Area: ' + (Math.round(properties[layer.areaAttribute] * 100.0) / 100.0).toFixed(2) + ' km<sup>2</sup>';
                this.popupContent.nativeElement.innerHTML = html;
                this.overlay.setPosition(point);
                const highlightSource = new VectorSource({
                    features: features
                });
                this.highlightLayer.setSource(highlightSource);

                // see if there are any csw records within this extent, if there are then display the "Select Data" link, otherwise hide it
                const cswRecords: CSWRecordModel[] = this.olMapService.getCSWRecordsForExtent(ext);
                if (cswRecords.length > 0) {
                    this.popupFooter.nativeElement.style.display = 'inline';
                } else {
                    this.popupFooter.nativeElement.style.display = 'none';
                }

                // zoom map to highlighted region
                map.getView().fit(ext);
            } else {
                this.overlay.setPosition(undefined);
                this.highlightLayer.setSource(undefined);
            }
        });
    }

}
