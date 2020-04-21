import { OlMapObject } from 'portal-core-ui/service/openlayermap/ol-map-object';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { RenderStatusService } from 'portal-core-ui/service/openlayermap/renderstatus/render-status.service';
import { Constants } from 'portal-core-ui/utility/constants.service';
import { AfterViewInit, Component, ElementRef, ViewChild, Inject } from '@angular/core';
import { point, polygon } from '@turf/helpers';
import inside from '@turf/inside';
import View from 'ol/View';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GroupLayer from 'ol/layer/Group';
import * as Extent from 'ol/extent';
import { MapBrowserEvent } from 'openlayers';


@Component({
    selector: 'app-ol-preview-map',
    template: `<div #previewMapElement style="height:100%;"></div>`
})

export class OlMapPreviewComponent implements AfterViewInit {
    @ViewChild('previewMapElement') mapElement: ElementRef;
    iDiv: any = null;
    new_id: any = null;
    olMapObject: OlMapObject = null;
    bboxGeojsonObjectArr: GeoJSON.FeatureCollection<any>[] = [];
    BBOX_LOW_STROKE_COLOUR = 'black';
    BBOX_HIGH_STROKE_COLOUR = '#ff33cc';
    BBOX_LOW_FILL_COLOUR = 'rgba(128,128,128,0.25)';
    BBOX_HIGH_FILL_COLOUR = 'rgba(255,179,236,0.4)';
    layerVectorArr: { [key: string]: VectorLayer } = {};


    constructor(private olMapService: OlMapService, @Inject('env') private env) {
        this.olMapObject = new OlMapObject(new RenderStatusService(), env);
        const map = this.olMapObject.getMap();
        const me = this;

        // When the user clicks on a rectangle in the preview, the main map zooms to the same area
        map.on('singleclick', function (event: MapBrowserEvent) {
            for (const featureColl of me.bboxGeojsonObjectArr) {
                for (const feat of featureColl.features) {
                    const poly = polygon([[feat.geometry.coordinates[0][0],
                    feat.geometry.coordinates[0][1], feat.geometry.coordinates[0][2],
                    feat.geometry.coordinates[0][3], feat.geometry.coordinates[0][4]]]);
                    if (inside(point(event.coordinate), poly)) {
                        me.olMapService.fitView([poly[0], poly[1], poly[2], poly[3]]);
                    }
                }
            }
        });
    }

    /**
     * Set the map target, refresh the map, disable map controls
     */
    ngAfterViewInit() {
        // After view init the map target can be set!
        const map = this.olMapObject.getMap();
        map.setTarget(this.mapElement.nativeElement);

        /*
        // Remove controls
        const contrColl = map.getControls();
        for (let i = 0; i < contrColl.getLength(); i++) {
            map.removeControl(contrColl.item(i));
        }
        // Disable pan and zoom via keyboard & mouse
        const actionColl = map.getInteractions();
        for (let i = 0; i < actionColl.getLength(); i++) {
            const action = actionColl.item(i);
            action.setActive(false);
        }
        */
    }

    /**
    * Adds bounding boxes to the preview map, recentres the map to the middle of the bounding boxes
    *
    * @param reCentrePt  Point to re-centre map
    * @param bboxGeojsonObj  Bounding boxes in GeoJSON format
    */
    setupBBoxes(reCentrePt: [number, number], bboxGeojsonObj: { [key: string]: GeoJSON.FeatureCollection<any> }) {
        for (const key in bboxGeojsonObj) {
            // Store the BBOXes for making the main map's view fit to the BBOX when BBOX is clicked on in preview map
            this.bboxGeojsonObjectArr.push(bboxGeojsonObj[key]);

            // Set up bounding box style
            const rectStyle = new Style({
                stroke: new Stroke({
                    color: this.BBOX_LOW_STROKE_COLOUR,
                    width: 2
                }),
                fill: new Fill({
                    color: this.BBOX_LOW_FILL_COLOUR
                })
            });
            const source = new VectorSource({
                features: (new GeoJSON()).readFeatures(bboxGeojsonObj[key])
            });
            const layerVector = new VectorLayer({
                source: source,
                style: [rectStyle]
            });

            // Keep a record of layers for bbox highlighting function
            this.layerVectorArr[key] = layerVector;

            // Add bounding boxes to map
            this.olMapObject.getMap().addLayer(layerVector);
        }

        // Only re-centre and zoom using valid coordinates, otherwise just recentre to middle of Australia
        let newView;
        if (isNaN(reCentrePt[0]) || isNaN(reCentrePt[1])) {
            newView = new View({ center: Constants.CENTRE_COORD, zoom: 3 });
        } else {
            newView = new View({ center: reCentrePt, zoom: 3 });
        }
        this.olMapObject.getMap().setView(newView);
    }

    /**
     * Highlights or unhighlights a bounding box in the preview map
     *
     * @param state if true will highlight bounding box, else will unhighlight it
     * @param key used for selecting which bounding box to (un)highlight
     */
    setBBoxHighlight(state: boolean, key: string) {
        const map = this.olMapObject.getMap();
        let strokeColour: string = this.BBOX_LOW_STROKE_COLOUR;
        let fillColour: string = this.BBOX_LOW_FILL_COLOUR;
        if (state) {
            strokeColour = this.BBOX_HIGH_STROKE_COLOUR;
            fillColour = this.BBOX_HIGH_FILL_COLOUR;
        }
        const layers = map.getLayers();
        // Find the selected layer using the 'layerVectorArry'
        for (const layer of layers.getArray()) {
            if (layer === this.layerVectorArr[key]) {
                // Renew the layer but with a new colour
                map.removeLayer(layer);
                const rectStyle = new Style({
                    stroke: new Stroke({
                        color: strokeColour,
                        width: 2
                    }),
                    fill: new Fill({
                        color: fillColour
                    })
                });
                layer.set('style', rectStyle);
                map.addLayer(layer);
                break;
            }
        }
    }

    /**
     * Fit the map's view to the extent of all layers
     */
    public fitViewToAllLayers(): void {
        let extent = Extent.createEmpty();
        let map = this.olMapObject.getMap();
        map.getLayers().forEach(function (layer) {
            if (layer instanceof GroupLayer) {
                layer.getLayers().forEach(function(groupLayer) {
                    if (layer instanceof VectorLayer) {
                        Extent.extend(extent, groupLayer.getExtent());
                    }
                });
            } else if (layer instanceof VectorLayer) {
                Extent.extend(extent, layer.getSource().getExtent());
            }
        });
        map.getView().fit(extent);
        map.getView().setZoom(map.getView().getZoom() - 2);
    }
}
