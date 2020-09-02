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
    @Input() isGskyLayer: boolean = false;
    @Output() bookMarkChoice = new EventEmitter();

    // Layer opacity only relevant to map control layer list
    layerOpacity: number = 100;

    // Keep track of GSKY (or other) layers that may currently be loading
    private layersLoading: Map<string, boolean> = new Map<string, boolean>();

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
     *
     * @param cswRecord
     */
    public addCSWRecord(cswRecord: CSWRecordModel): void {
        if (this.isExpandableRecord(cswRecord)) {
            this.loadExpandedLayers(cswRecord);
        } else {
            try {
                // Clone the record before adding in case we need to modify details for GSKY records
                let clonedRecord = JSON.parse(JSON.stringify(cswRecord));

                // Check online resources to see if protocol request has been set
                // denoting a specific layer of the WMS/WCS etc. and rebuild URL
                for (let resource of clonedRecord.onlineResources) {
                    // WMS
                    if (this.isGetCapabilitiesUrl(resource.url, 'wms') && resource.protocolRequest !== "") {
                        resource.name = resource.protocolRequest;
                        // TODO: Stricter URL rewriting
                        resource.url = resource.url.substring(0, resource.url.indexOf('?') + 1) + "service=WMS";
                    } else if ((this.isGetCapabilitiesUrl(resource.url, 'wcs') /*|| resource.type.toLowerCase() == 'ncss'*/) && resource.protocolRequest !== "") {
                        resource.name = resource.protocolRequest;
                    }
                    // TODO: WFS?


                }
                this.olMapService.addCSWRecord(clonedRecord);

                // Set a time if an extent exists
                if (clonedRecord.temporalExtent && clonedRecord.temporalExtent.endPosition) {
                    console.log("Changing to end position: " + JSON.stringify(clonedRecord.temporalExtent.endPosition));
                    this.changeTime(clonedRecord.temporalExtent.endPosition);
                }
            } catch (error) {
                // TODO: Proper error reporting
                alert(error.message);
            }
        }
    }

    /**
     *
     * @param recordId
     */
    public removeCSWRecord(recordId: string): void {
        this.olMapService.removeLayer(this.olMapService.getLayerModel(recordId));
        this.timeExtentList = [];
        this.timeExtentStatus = "";
    }

    /**
     *
     * @param cswRecord
     */
    public displayRecordInformation(cswRecord) {
        if (cswRecord) {
            const modelRef = this.modalService.open(RecordModalComponent, { size: 'lg' });
            modelRef.componentInstance.record = cswRecord;
        }
    }

    /**
     *
     * @param cswRecord
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
     *
     * @param cswRecord
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
     * @param cswRecord
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
     * checks if a csw record has been bookmarked by the user
     * @param cswRecord
     */
    public isBookMark(cswRecord: CSWRecordModel) {
        return this.cswSearchService.isBookMark(cswRecord);
    }

    /**
     * remove dataset as favourite and emit the event "remove" to be processed by datasets.component
     * @param cswRecord
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
     * For a standard layer:
     *
     *   1. Has online resource.
     *   2. Has at least one defined geographicElement.
     *   3. Layer does not already exist on map.
     *   4. One online resource is of type WMS, WFS, CSW or WWW.
     *
     * For a GSKY layer:
     *
     *   1. WMS endpoint exists as a GetCapabilities URL, and a protocolRequest
     *      value is present.
     *   2. Some other online resource that can be downloaded is present,
     *      currently one of:
     *      - WCS GetCapabilities with a protocolRequest value set.
     *      - NetCDF endpoint with a protocolRequest value set.
     *
     * @param cswRecord the CSWRecord to verify
     * @return true is CSWRecord can be added, false otherwise
     */
    public isAddableRecord(cswRecord: CSWRecordModel): boolean {
        let addable: boolean = false;
        // Basic checks
        if (cswRecord.hasOwnProperty('onlineResources') &&
                cswRecord.onlineResources != null &&
                cswRecord.onlineResources.some(resource => VALID_ONLINE_RESOURCE_TYPES.indexOf(resource.type) > -1) &&
                cswRecord.geographicElements.length > 0 &&
                !this.olMapService.layerExists(cswRecord.id)) {
            addable = true;
            // GSKY checks - If resource is a WMS GetCapabilities request then
            // protocol request must be present otherwise it's expandable, not
            // addable
            const wmsResource: OnlineResourceModel = this.getCapabilitiesOnlineResource(cswRecord, 'wms');
            if (wmsResource && this.isGetCapabilitiesUrl(wmsResource.url, "wms") && wmsResource.protocolRequest && wmsResource.protocolRequest === "") {
                addable = false;
            }
        }
        return addable;
    }

    /**
     * Determine if record is expandable. That is, instead of being added to
     * the map it's queried to display sub-layers (e.g. a WMS GetCapabilities
     * endpoint).
     *
     * TODO: stricter checks.
     *
     * If both conditions are met:
     *   - Has a WMS OnlineResourceModel with a GetCapabilities URL and NO protocolRequest value.
     *   - Has a WCS OnlineResourceModel with a GetCapabilities URL and NO protocolRequest value.
     *
     * @param cswRecord
     */
    public isExpandableRecord(cswRecord: CSWRecordModel): boolean {
        const wmsResource: OnlineResourceModel = this.getCapabilitiesOnlineResource(cswRecord, 'wms');
        const wcsResource: OnlineResourceModel = this.getCapabilitiesOnlineResource(cswRecord, 'wcs');
        return wmsResource != null && (wmsResource.protocolRequest == null || wmsResource.protocolRequest.trim() === "") &&
               wcsResource != null && (wcsResource.protocolRequest == null || wcsResource.protocolRequest.trim() === "");
    }

    /**
     *
     * @param layerId
     */
    public areLayersLoading(layerId: string): boolean {
        return this.layersLoading.get(layerId) === true;
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
     * Return true if a CSWRecordModel has child records.
     * Currently the only indicator of GSKY records.
     *
     * @param cswRecord
     */
    public hasChildRecords(cswRecord: CSWRecordModel): boolean {
        if (cswRecord.hasOwnProperty('childRecords') &&
           cswRecord.childRecords != null &&
           cswRecord.childRecords.length > 0) {
            return true;
        }
        return false;
    }

    /**
     * Remove all child records from a particular record
     *
     * @param cswRecord
     */
    public removeChildRecords(cswRecord: CSWRecordModel) {
        if (cswRecord.hasOwnProperty('childRecords')) {
            cswRecord.childRecords = [];
        }
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
     * Retrieve a GSKY record's layers and add them to the record as child records
     *
     * @param cswRecord
     */
    loadExpandedLayers(cswRecord: CSWRecordModel) {
        this.layersLoading.set(cswRecord.id, true);
        const wmsGetCapResource: OnlineResourceModel = this.getCapabilitiesOnlineResource(cswRecord, 'wms');
        const wcsGetCapResource: OnlineResourceModel = this.getCapabilitiesOnlineResource(cswRecord, 'wcs');
        if (wmsGetCapResource != null && wcsGetCapResource != null) {
            // Construct a corresponding WCS record for each layer in the WMS
            this.vglService.getCustomLayerRecords(wmsGetCapResource.url).subscribe((response: CSWRecordModel[]) => {
                for (let layer of response) {
                    let wcsOnlineResource: OnlineResourceModel = {
                        applicationProfile: layer.onlineResources[0].applicationProfile,
                        description: layer.onlineResources[0].description,
                        // TODO: Check custom layer response, use csw record bounds if none
                        geographicElements: layer.onlineResources[0].geographicElements,
                        // geographicElements: cswRecord.geographicElements,
                        name: layer.onlineResources[0].name,
                        type: 'WCS',
                        url: wcsGetCapResource.url,
                        // TODO: from GetCapabilities <WCS_Capabilities ... version="1.0.0"> OR DescribeCoverage <CoverageDescription ... version="1.0.0.">
                        version: '',
                        protocolRequest: layer.onlineResources[0].protocolRequest
                    };
                    layer.onlineResources.push(wcsOnlineResource);
                    cswRecord.childRecords.push(layer);
                }
            }, error => {
                // TODO: Do something
            }, () => {
                this.layersLoading.set(cswRecord.id, false);
            });
        }
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
     * TODO: Restrict
     *
     * @param record CSW record
     */
    public allowGraceStyleChange(record: CSWRecordModel): boolean {
        return true;
    }

    /**
     * TODO: Needs better check
     * XXX
     */
    public isGraceRecord(): boolean {
        if (this.cswRecord.id.toLowerCase().startsWith('mascons')) {
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
            console.log("Settings defaults");
            this.graceStyleSettings = {
                minColor: '#ff0000',
                minValue: -8,
                neutralColor: '#ffffff',
                neutralValue: 0,
                maxColor: '#0000ff',
                maxValue: 4
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
                maxValue: newStyle.maxValue
            };
           const sldUrl = 'http://localhost:8001/sld/' +
                this.cswRecord.id + '/' +
                this.graceStyleSettings.minValue + '/' +
                this.graceStyleSettings.minColor.substr(1) + '/' +
                this.graceStyleSettings.neutralValue + '/' +
                this.graceStyleSettings.neutralColor.substr(1) + '/' +
                this.graceStyleSettings.maxValue + '/' +
                this.graceStyleSettings.maxColor.substr(1);
           this.olMapService.setLayerSourceParam(this.cswRecord.id, 'LAYERS', undefined);
           this.olMapService.setLayerSourceParam(this.cswRecord.id, 'SLD', sldUrl);
        }, () => {});
    }

}
