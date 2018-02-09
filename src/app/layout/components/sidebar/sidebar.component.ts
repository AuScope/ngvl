import { environment } from '../../../../environments/environment';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { LayerModel } from 'portal-core-ui/model/data/layer.model';
import { LayerHandlerService } from 'portal-core-ui/service/cswrecords/layer-handler.service';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { Bbox } from 'portal-core-ui/model/data/bbox.model';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CSWSearchService } from '../../../shared/services/csw-search.service';

import olProj from 'ol/proj';
import olExtent from 'ol/extent';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

    readonly CSW_RECORD_PAGE_LENGTH = 10;
    currentCSWRecordPage: number = 1;

    isActive: boolean = false;
    showMenu: string = '';

    // Search results
    cswRecords: CSWRecordModel[] = [];
    selectedCSWRecord = null;
    recordsLoading = false;

    // Registry results
    availableRegistries: any = [];    // TODO: Registry model

    // Collapsable menus
    anyTextIsCollapsed: boolean = true;
    spatialBoundsIsCollapsed: boolean = true;
    keywordsIsCollapsed: boolean = true;
    servicesIsCollapsed: boolean = true;
    pubDateIsCollapsed: boolean = true;
    registriesIsCollapsed: boolean = true;
    searchResultsIsCollapsed: boolean = true;

    // Facted search parameters
    anyTextValue: string = "";
    spatialBounds: olExtent;
    spatialBoundsText: string = "";
    dateTo: any = null;
    dateFrom: any = null;


    constructor(private layerHandlerService: LayerHandlerService, private olMapService: OlMapService,
        private httpClient: HttpClient, private cswSearchService: CSWSearchService,
        private modalService: NgbModal) {
    }

    ngOnInit(): void {
        // Test keyword search
        /*
        let serviceIds: string[] = ['cswNCI'];
        this.cswSearchService.getFacetedKeywords(serviceIds).subscribe(data => {
            console.log(data);
            console.log("data[2]: " + data[2]);
        });
        */
        // Load available registries
        this.cswSearchService.getAvailableRegistries().subscribe(data => {
            this.availableRegistries = data;
            for (let registry of this.availableRegistries) {
                registry.checked = true;
                registry.startIndex = 1;
                registry.prevIndices = [];
            }
            // Populate initial results (if thisisn't desired, add checks to
            // facetedSearch to ensure at least 1 filter has been used or de-
            // selecting a registry will populate results)
            this.facetedSearch();
        }, error => {
            // TODO: Proper error reporting
            console.log("Unable to retrieve registries: " + error.message);
        });
    }

    eventCalled() {
        this.isActive = !this.isActive;
    }


    /**
     * Search results based on the current faceted search panel values
     * 
     * TODO: Add spinner to results panel
     */
    public facetedSearch(): void {
        this.cswRecords = [];
        let httpParams = new HttpParams();
        httpParams = httpParams.append('limit', this.CSW_RECORD_PAGE_LENGTH.toString());

        // Available registries and start
        let registrySelected: boolean = false;
        for (let registry of this.availableRegistries) {
            if (registry.checked) {
                registrySelected = true;
                httpParams = httpParams.append('serviceId', registry.id);
                httpParams = httpParams.append('start', registry.startIndex);
            }
        }
        // If no registries are selected, there's nothing to search
        if(!registrySelected)
            return;

        // Any text search
        if (this.anyTextValue) {
            httpParams = httpParams.append('field', 'anytext');
            httpParams = httpParams.append('value', this.anyTextValue);
            httpParams = httpParams.append('type', 'string');
            httpParams = httpParams.append('comparison', 'eq');
        }

        // Spatial bounds
        if (this.spatialBounds != null) {
            httpParams = httpParams.append('field', 'bbox');
            let boundsStr = '{"northBoundLatitude":' + this.spatialBounds[3] +
                ',"southBoundLatitude":' + this.spatialBounds[1] +
                ',"eastBoundLongitude":' + this.spatialBounds[2] +
                ',"westBoundLongitude":' + this.spatialBounds[0] +
                ',"crs":"EPSG:4326"}';
            httpParams = httpParams.append('value', boundsStr);
            httpParams = httpParams.append('type', 'bbox');
            httpParams = httpParams.append('comparison', 'eq');
        }

        // Publication dates
        if (this.dateFrom != null && this.dateTo != null) {
            httpParams = httpParams.append('field', 'datefrom');
            httpParams = httpParams.append('field', 'dateto');
            let fromDate = Date.parse(this.dateFrom.year + '-' + this.dateFrom.month + '-' + this.dateFrom.day);
            let toDate = Date.parse(this.dateTo.year + '-' + this.dateTo.month + '-' + this.dateTo.day);
            httpParams = httpParams.append('value', fromDate.toString());
            httpParams = httpParams.append('value', toDate.toString());
            httpParams = httpParams.append('type', 'date');
            httpParams = httpParams.append('type', 'date');
            httpParams = httpParams.append('comparison', 'gt');
            httpParams = httpParams.append('comparison', 'lt');
        }

        this.recordsLoading = true;
        this.httpClient.post(environment.portalBaseUrl + 'facetedCSWSearch.do', httpParams.toString(), {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
            responseType: 'json'
        }).subscribe(response => {
            for(let registry of this.availableRegistries) {
                registry.prevIndices.push(registry.startIndex);
                registry.startIndex = response['data'].nextIndexes[registry.id];
            }
            this.cswRecords = response['data'].records;
            this.recordsLoading = false;
            // TODO: Ensure results visible if drop-down not expanded
        });
    }


    /**
     * 
     */
    public resetFacetedSearch(): void {
        this.currentCSWRecordPage = 1;
        // Reset registry start and previous indices
        for(let registry of this.availableRegistries) {
            registry.startIndex = 1;
            registry.prevIndices = [];
        }
        this.facetedSearch();
    }


    /**
     * Are there more results to display?
     * 
     * @returns true if at least one registry has (nextIndex > 0), false
     *          otherwise
     */
    public hasNextResultsPage(): boolean {
        for(let registry of this.availableRegistries) {
            if(registry.startIndex != 0) {
                return true;
            }
        }
        return false;
    }


    /**
     * 
     */
    public previousResultsPage(): void {
        if (this.currentCSWRecordPage != 1) {
            this.currentCSWRecordPage -= 1;
            for(let registry of this.availableRegistries) {
                if(registry.prevIndices.length >= 2) {
                    registry.startIndex = registry.prevIndices[registry.prevIndices.length - 2];
                    registry.prevIndices.splice(registry.prevIndices.length - 2, 2);
                }
            }
            this.facetedSearch();
        }
    }


    /**
     * 
     */
    public nextResultsPage(): void {
        this.currentCSWRecordPage += 1;
        this.facetedSearch();
    }


    /**
     * 
     * @param cswRecord 
     */
    public addCSWRecord(cswRecord: CSWRecordModel): void {
        this.olMapService.addCSWRecord(cswRecord);
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
    public showCSWRecordInformation(cswRecordModal, cswRecord): void {
        if (cswRecord) {
            this.selectedCSWRecord = cswRecord;
            this.modalService.open(cswRecordModal);
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
            const extent: olExtent = olProj.transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
            this.olMapService.displayExtent(extent);
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
            const extent: olExtent = olProj.transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
            this.olMapService.fitView(extent);
        }
    }


    /**
     * 
     */
    public drawBound(): void {
        this.olMapService.drawBound().subscribe((vector) => {

            const features = vector.getSource().getFeatures();
            const me = this;
            // Go through this array and get coordinates of their geometry.
            features.forEach(function (feature) {

                const bbox4326 = feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
                alert('bounds:' + bbox4326.getExtent()[2] + ' ' + bbox4326.getExtent()[0] + ' ' + bbox4326.getExtent()[3] + ' ' + bbox4326.getExtent()[1]);
            });

        });
    }


    /**
     * 
     */
    public drawSpatialBounds(): void {
        this.olMapService.drawBound().subscribe((vector) => {
            this.spatialBounds = olProj.transformExtent(vector.getSource().getExtent(), 'EPSG:3857', 'EPSG:4326');
            this.updateSpatialBoundsText(this.spatialBounds);
            this.resetFacetedSearch();
        });
    }


    /**
     * 
     */
    public spatialBoundsFromMap(): void {
        this.spatialBounds = olProj.transformExtent(this.olMapService.getMapExtent(), 'EPSG:3857', 'EPSG:4326');
        this.updateSpatialBoundsText(this.spatialBounds);
        this.resetFacetedSearch();

    }

    
    /**
     * 
     * @param extent 
     */
    public updateSpatialBoundsText(extent: olExtent): void {
        let w = extent[3].toFixed(4);
        let n = extent[0].toFixed(4);
        let s = extent[1].toFixed(4);
        let e = extent[2].toFixed(4);
        this.spatialBoundsText = w + ", " + n + " to " + s + ", " + e;
    }


    /**
     * 
     */
    public publicationDateChanged(): void {
        if (this.isValidDate(this.dateFrom) && this.isValidDate(this.dateTo)) {
            console.log("PubDate change - searching...");
            this.resetFacetedSearch();
        }
    }


    /**
     * TODO: Maybe switch event to lose focus, this will check after every key press.
     *       Tried to use (change) but ngbDatepicker hijacks the event.
     * @param date 
     */
    private isValidDate(date): boolean {
        if (date && date.year && date.month)
            return true;
        return false;
    }


    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

}


// /**
//   * Retrieve csw records from the service and organize them by group
//   * @returns a observable object that returns the list of csw record organized in groups
//   */
//  public getLayerRecord(): Observable<any> {
//    const me = this;
//    if (this.layerRecord.length > 0) {
//        return Observable.of(this.layerRecord);
//    } else {
//      return this.http.get(this.env.portalBaseUrl + this.env.getCSWRecordUrl)
//        .map(response => {
//            const cswRecord = response['data'];
//            cswRecord.forEach(function(item, i, ar) {
//              if (me.layerRecord[item.group] === undefined) {
//                me.layerRecord[item.group] = [];
//              }
//              // VT: attempted to cast the object into a typescript class however it doesn't seem like its possible
//              // all examples points to casting from json to interface but not object to interface.
//              item.expanded = false;
//              item.hide = false;
//              me.layerRecord[item.group].push(item);
//            });
//            return me.layerRecord;
//        });
//    }
//  }
