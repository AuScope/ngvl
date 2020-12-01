import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { BookMark } from '../../../shared/modules/vgl/models';
import { RecordModalComponent } from '../record.modal.component';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { CSWSearchService } from '../../../shared/services/csw-search.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as Proj from 'ol/proj';
import { OnlineResourceModel } from 'portal-core-ui/model/data/onlineresource.model';
import { VglService } from '../../../shared/modules/vgl/vgl.service';
import { StyleChooserModalComponent } from '../../../shared/modules/grace/style-chooser.modal.component';
import { GraceStyleSettings } from '../../../shared/modules/grace/grace-graph.models';
import { GraceService } from '../../../shared/modules/grace/grace.service';
import { GraceStyleService } from '../../../shared/modules/grace/grace-style.service';
import { environment } from '../../../../environments/environment';


// List of valid online resource types that can be added to the map
const VALID_ONLINE_RESOURCE_TYPES: string[] = ['WMS', 'WFS', 'CSW', 'WWW'];

@Component({
    selector: 'app-datasets-record',
    templateUrl: './datasets-record.component.html',
    styleUrls: ['./datasets-record.component.scss']
})
export class DatasetsRecordComponent {

    @Input() registries: any = [];
    @Input() cswRecord: CSWRecordModel;
    @Input() bookMarkList: BookMark[] = [];
    @Input() validUser: boolean = false;
    // Map controls will not have an add layer button, and will have a transparency button
    @Input() isMapControl: boolean = false;
    @Output() bookMarkChoice = new EventEmitter();

    // Layer opacity only relevant to map control layer list
    layerOpacity: number = 100;

    // Keep track of time extents that may be loading via GetCap requests
    public timeExtentStatus: string;
    public timeExtentList: string[] = [];
    public selectedTimeExtent = "";

    // GRACE graph settings (optional)
    private graceStyleSettings: GraceStyleSettings;

    // Selected time period (optional)
    private timePeriod: string;


    constructor(public olMapService: OlMapService,
                public cswSearchService: CSWSearchService,
                public vglService: VglService,
                public graceService: GraceService,
                public modalService: NgbModal,
                public activeModal: NgbActiveModal) { }

    /**
     * Add CSW record layer to the map
     *
     * @param cswRecord CSW record to add to map as layer
     */
    public addCSWRecord(cswRecord: CSWRecordModel): void {
        this.olMapService.addCSWRecord(cswRecord);
    }

    /**
     * Remove the layer for the CSW record from the map
     *
     * @param recordId ID of CSW record to remove
     */
    public removeCSWRecord(recordId: string): void {
        this.olMapService.removeLayer(this.olMapService.getLayerModel(recordId));
        this.timeExtentList = [];
        this.timeExtentStatus = "";
    }

    /**
     * Display the record information dialog
     *
     * @param cswRecord CSW record for information
     */
    public displayRecordInformation(cswRecord) {
        if (cswRecord) {
            const modelRef = this.modalService.open(RecordModalComponent, { size: 'lg' });
            modelRef.componentInstance.record = cswRecord;
        }
    }

    /**
     * Show the bounds for the layer correspondng to the supplied CSW record
     *
     * @param cswRecord CSW record for bounds
     */
    public showCSWRecordBounds(cswRecord: CSWRecordModel): void {
        if (cswRecord.geographicElements.length > 0) {
            let bounds = cswRecord.geographicElements.find(i => i.type === 'bbox');
            const bbox: [number, number, number, number] =
                [bounds.westBoundLongitude, bounds.southBoundLatitude, bounds.eastBoundLongitude, bounds.northBoundLatitude];
            const extent = Proj.transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
            this.olMapService.displayExtent(extent, 3000);
        }
    }

    /**
     * Zoom the map to the bounds of the layer for the given CSW record
     *
     * @param cswRecord CSW record for bounds
     */
    public zoomToCSWRecordBounds(cswRecord: CSWRecordModel): void {
        if (cswRecord.geographicElements.length > 0) {
            let bounds = cswRecord.geographicElements.find(i => i.type === 'bbox');
            const bbox: [number, number, number, number] =
                [bounds.westBoundLongitude, bounds.southBoundLatitude, bounds.eastBoundLongitude, bounds.northBoundLatitude];
            const extent = Proj.transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
            this.olMapService.fitView(extent);
        }
    }

    /**
     * Bookmark a dataset as favourite and emit the event "add" to be processed by datasets.component
     *
     * @param cswRecord CSW record to bookmark for current user
     */
    public addBookMark(cswRecord: CSWRecordModel) {
        let serviceId: string = this.cswSearchService.getServiceId(cswRecord);
        let fileIdentifier: string = cswRecord.id;
        this.cswSearchService.addBookMark(fileIdentifier, serviceId).subscribe(id => {
            this.bookMarkChoice.emit({ choice: "add", bookmark: {id: id, fileIdentifier: fileIdentifier, serviceId : serviceId}, cswRecord: cswRecord });
        }, error => {
            console.log(error.message);
        });
    }

    /**
     * Checks if a csw record has been bookmarked by the user
     *
     * @param cswRecord CSW record to test whether already bookmarked
     */
    public isBookMark(cswRecord: CSWRecordModel) {
        return this.cswSearchService.isBookMark(cswRecord);
    }

    /**
     * Remove dataset as favourite and emit the event "remove" to be processed by datasets.component
     *
     * @param cswRecord CSW record for which to remove bookmark
     */
    public removeBookMark(cswRecord: CSWRecordModel) {
       let bookmarkId: number = this.cswSearchService.getBookMarkId(cswRecord);
        this.cswSearchService.removeBookMark(bookmarkId).subscribe(data => {
            this.bookMarkChoice.emit({ choice: "remove", bookmark: {id : bookmarkId }, cswRecord: cswRecord });
        }, error => {
            console.log(error.message);
        });
    }

    /**
     * Determine if a CSWRecord meets the criteria to be added to the map.
     *
     * Will return true if layer satisfies:
     *
     *   1. Has online resource.
     *   2. Has at least one defined geographicElement.
     *   3. Layer does not already exist on map.
     *   4. One online resource is of type WMS, WFS, CSW or WWW.
     *
     * @param cswRecord the CSWRecord to verify
     * @return true is CSWRecord can be added, false otherwise
     */
    public isAddableRecord(cswRecord: CSWRecordModel): boolean {
        let addable: boolean = false;
        if (cswRecord.hasOwnProperty('onlineResources') &&
                cswRecord.onlineResources != null &&
                cswRecord.onlineResources.some(resource => VALID_ONLINE_RESOURCE_TYPES.indexOf(resource.type) > -1) &&
                cswRecord.geographicElements.length > 0 &&
                !this.olMapService.layerExists(cswRecord.id)) {
            addable = true;
        }
        return addable;
    }

    /**
     * Check if a record has already been added to the map
     *
     * @param cswRecord the record to check
     */
    public isRecordAddedToMap(cswRecord: CSWRecordModel): boolean {
        return this.olMapService.layerExists(cswRecord.id);
    }

    /**
     * Parse a URL to determine if it is a GetCapabilities request
     *
     * @param url URL to parse
     * @param serviceType service type ('wms' or 'wcs')
     */
    isGetCapabilitiesUrl(url: string, serviceType: string): boolean {
        if (url.toLowerCase().startsWith("http")) {
            // TODO: Given this is currently only used for GSKY, could search for "gsky" in URL
            let paramIndex = url.indexOf("?");
            if (paramIndex !== -1) {
                if (url.toLowerCase().indexOf("request=getcapabilities", paramIndex) !== -1 &&
                    url.toLowerCase().indexOf("service=" + serviceType.toLowerCase(), paramIndex) !== -1) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Parse the CSW record to see if it has a GetCapabilities request (WMS or WCS)
     *
     * @param url endpoint
     */
    public getCapabilitiesOnlineResource(record: CSWRecordModel, serviceType: string): OnlineResourceModel {
        if (record.onlineResources) {
            const onlineResource: OnlineResourceModel = record.onlineResources.find(i => i.type.toLowerCase() === serviceType.toLowerCase());
            if (onlineResource && this.isGetCapabilitiesUrl(onlineResource.url, serviceType)) {
                return onlineResource;
            }
        }
        return null;
    }

    /**
     *
     * @param layerId
     * @param opacity
     */
    public setLayerOpacity(e: any) {
        this.layerOpacity = e.value;
        this.olMapService.setLayerOpacity(this.cswRecord.id, e.value / 100);
    }

    /**
     * Does the CSWRecord have a temporal extent?
     */
    public hasTemporalExtent(): boolean {
        if (this.cswRecord.temporalExtent &&
            this.cswRecord.temporalExtent.beginPosition &&
            this.cswRecord.temporalExtent.endPosition &&
            this.cswRecord.temporalExtent.beginPosition !== this.cswRecord.temporalExtent.endPosition) {
                return true;
            }
    }

    /**
     * Get a list of times this record may have. Requires the CSWRecord to have
     * a temporalExtent set and an associated WMS OnlineResource against which a
     * GetCapabilities request can be made to retrieve times
     */
    public loadTimes() {
        const wmsResource: OnlineResourceModel = this.cswRecord.onlineResources.find(
            resource => resource.type.toLocaleLowerCase() === 'wms');
        if (wmsResource) {
            this.timeExtentList = [];
            this.selectedTimeExtent = "";
            this.timeExtentStatus = 'loading';
            // GRACE times via a call to grace-api
            if (this.isGraceRecord()) {
                this.graceService.getGraceDates().subscribe(response => {
                    if (response) {
                        this.timeExtentList = response;
                        this.timeExtentStatus = 'loaded';
                    }
                }, error => {
                    this.timeExtentStatus = 'error';
                });
            } else {
                // General WMS times via GetCapabilities request
                // TODO: Currently must be 1.1.1, perhaps due to Geoserver configuration
                this.vglService.getWmsCapabilities(wmsResource.url, "1.1.1").subscribe(response => {
                    if (response && response.layers) {
                        let layer = response.layers.find(l => l.name === wmsResource.name);
                        // Name may not have matched due to being appended with "<workspace>:"
                        if (!layer) {
                            for (let wmsLayer of response.layers) {
                                const colonIndex = wmsLayer.name.indexOf(':');
                                if (colonIndex !== -1) {
                                    const layerName: string = wmsLayer.name.substring(colonIndex + 1, wmsLayer.name.length + 1);
                                    if (layerName === wmsResource.name) {
                                        layer = wmsLayer;
                                        break;
                                    }
                                }
                            }
                        }
                        if (layer && layer.timeExtent && layer.timeExtent.length > 0) {
                            this.timeExtentList = layer.timeExtent;
                        }
                    }
                    this.timeExtentStatus = 'loaded';
                }, error => {
                    this.timeExtentStatus = 'error';
                });
            }
        }
    }

    /**
     * Change the time of the map layer
     *
     * @param newTime the new time to display
     */
    changeTime(newTime: string) {
        this.olMapService.setLayerSourceParam(this.cswRecord.id, 'TIME', newTime);
    }

    /**
     * TODO: Needs better check
     */
    public isGraceRecord(): boolean {
        if (environment.grace && environment.grace.layers &&
                environment.grace.layers.indexOf(this.cswRecord.id) >= 0) {
            return true;
        }
        return false;
    }

    /**
     * Set the WMS style for the layer
     *
     * @param record CSW record
     */
    changeGraceStyle(record: CSWRecordModel) {
        if (this.graceStyleSettings === undefined || this.graceStyleSettings === null) {
            this.graceStyleSettings = {
                minColor: '#ff0000',
                minValue: -8,
                neutralColor: '#ffffff',
                neutralValue: 0,
                maxColor: '#0000ff',
                maxValue: 4,
                transparentNeutralColor: false
            };
        }
        const modalRef = this.modalService.open(StyleChooserModalComponent, { size: 'sm' });
        modalRef.componentInstance.graceStyleSettings = this.graceStyleSettings;
        modalRef.result.then(newStyle => {
            this.graceStyleSettings = {
                minColor: newStyle.minColor,
                minValue: newStyle.minValue,
                neutralColor: newStyle.neutralColor,
                neutralValue: newStyle.neutralValue,
                maxColor: newStyle.maxColor,
                maxValue: newStyle.maxValue,
                transparentNeutralColor: newStyle.transparentNeutralColor
            };
            const sld = GraceStyleService.getGraceSld('mascons_stage4_V003a', 'mascon_style', this.graceStyleSettings);
            this.olMapService.setLayerSourceParam(this.cswRecord.id, 'LAYERS', undefined);
            this.olMapService.setLayerSourceParam(this.cswRecord.id, 'SLD_BODY', sld);
        }, () => {});
    }

}
