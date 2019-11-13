import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { BookMark } from '../../../shared/modules/vgl/models';
import { RecordModalComponent } from '../record.modal.component';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { CSWSearchService } from '../../../shared/services/csw-search.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Proj from 'ol/proj';
import { OnlineResourceModel } from 'portal-core-ui/model/data/onlineresource.model';
import { VglService } from '../../../shared/modules/vgl/vgl.service';


// List of valid online resource types that can be added to the map
const VALID_ONLINE_RESOURCE_TYPES: string[] = ['WMS', 'WFS', 'CSW', 'WWW'];

@Component({
    selector: 'app-datasets-record',
    templateUrl: './datasets-record.component.html',
    styleUrls: ['./datasets-record.component.scss']
})
export class DatasetsRecordComponent {

    @Input() registries: any = [];
    //@Input() cswRecordList: CSWRecordModel[] = [];
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


    constructor(public olMapService: OlMapService,
                public cswSearchService: CSWSearchService,
                public vglService: VglService,
                public modalService: NgbModal,
                public activeModal: NgbActiveModal) { }


    /**
     *
     * @param cswRecord
     */
    public addCSWRecord(cswRecord: CSWRecordModel): void {
        if(this.isGskyRecord(cswRecord)) {
            this.loadGskyLayers(cswRecord);
        } else try {
            this.olMapService.addCSWRecord(cswRecord);
        } catch (error) {
            // TODO: Proper error reporting
            alert(error.message);
        }
    }

    /**
     *
     * @param recordId
     */
    public removeCSWRecord(recordId: string): void {
        this.olMapService.removeLayer(this.olMapService.getLayerModel(recordId));
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
     * TODO: further checks
     * For GSKY server:
     * 
     *   1. WMS and WCS endpoints exist and both are GetCapability requests.
     *
     * @param cswRecord the CSWRecord to verify
     * @return true is CSWRecord can be added, false otherwise
     */
    public canRecordBeAdded(cswRecord: CSWRecordModel): boolean {
        return cswRecord.hasOwnProperty('onlineResources') &&
               cswRecord.onlineResources != null &&
               cswRecord.onlineResources.length > 0 &&
               cswRecord.geographicElements.length > 0 &&
               // GSKY layer
               (this.isGskyRecord(cswRecord) ||
                // Standard layer
               (!this.olMapService.layerExists(cswRecord.id) &&
                 cswRecord.onlineResources.some(resource => VALID_ONLINE_RESOURCE_TYPES.indexOf(resource.type) > -1)));
    }

    /**
     * TODO: Not an ideal test
     * 
     * @param cswRecord 
     */
    public isGskyRecord(cswRecord: CSWRecordModel): boolean {
        return this.getCapabilitiesOnlineResource(cswRecord, 'wms') != null &&
               this.getCapabilitiesOnlineResource(cswRecord, 'wcs') != null;
    }

    /**
     * 
     * @param layerId 
     */
    public areLayersLoading(layerId: string): boolean {
        return this.layersLoading.get(layerId) == true;
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
        if(cswRecord.hasOwnProperty('childRecords') &&
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
        if(cswRecord.hasOwnProperty('childRecords')) {
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
        if(record.onlineResources) {
            for(let resource of record.onlineResources) {
                if(this.isGetCapabilitiesUrl(resource.url, serviceType)) {
                    return resource;
                }
            }
        }
        return null;
    }

    /**
     * Retrieve a GSKY record's layers and add them to the record as child records
     * 
     * @param cswRecord 
     */
    loadGskyLayers(cswRecord: CSWRecordModel) {
        this.layersLoading.set(cswRecord.id, true);
        const wmsGetCapResource: OnlineResourceModel = this.getCapabilitiesOnlineResource(cswRecord, 'wms');
        const wcsGetCapResource: OnlineResourceModel = this.getCapabilitiesOnlineResource(cswRecord, 'wcs');

        if(wmsGetCapResource != null && wcsGetCapResource != null) {
            this.vglService.getCustomLayerRecords(wmsGetCapResource.url).subscribe((response: CSWRecordModel[]) => {
                for(let layer of response) {
                    let wcsOnlineResource: OnlineResourceModel = {
                        applicationProfile: '',
                        description: layer.onlineResources[0].description,
                        geographicElements: layer.onlineResources[0].geographicElements,
                        name: layer.onlineResources[0].name,
                        type: 'WCS',
                        url: wcsGetCapResource.url,
                        // TODO: from GetCapabilities <WCS_Capabilities ... version="1.0.0"> OR DescribeCoverage <CoverageDescription ... version="1.0.0.">
                        version: ''
                    }
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
        this.olMapService.setLayerOpacity(this.cswRecord.id, e.value/100);
    }

    

    /*
    changeTime() {
        console.log("Test change time...");
        this.olMapService.setLayerSourceParam('unique-id-blend_sentinel2_landsat_nbart_daily_false_colour', 'TIME', '1991-03-20T00:00:00.000Z');
    }
    */

}
