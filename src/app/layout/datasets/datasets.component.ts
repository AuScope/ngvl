import { Component, OnInit, AfterViewChecked, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { RecordModalContent } from './record.modal.component';
import { routerTransition } from '../../router.animations';
import { UserStateService, DATA_VIEW } from '../../shared';
import { CSWSearchService } from '../../shared/services/csw-search.service';

import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import olProj from 'ol/proj';
import olExtent from 'ol/extent';

import { NgbTypeahead, NgbModal } from '@ng-bootstrap/ng-bootstrap';




@Component({
    selector: 'app-datasets',
    templateUrl: './datasets.component.html',
    styleUrls: ['./datasets.component.scss'],
    animations: [routerTransition()]
})
export class DatasetsComponent implements OnInit, AfterViewChecked {

    readonly CSW_RECORD_PAGE_LENGTH = 10;
    currentCSWRecordPage: number = 1;

    // Search results
    cswSearchResults: CSWRecordModel[] = [];
    selectedCSWRecord = null;
    recordsLoading = false;

    // Collapsable menus
    anyTextIsCollapsed: boolean = true;
    spatialBoundsIsCollapsed: boolean = true;
    keywordsIsCollapsed: boolean = true;
    servicesIsCollapsed: boolean = true;
    pubDateIsCollapsed: boolean = true;
    registriesIsCollapsed: boolean = true;
    searchResultsIsCollapsed: boolean = true;

    // Faceted search parameters
    anyTextValue: string = "";
    spatialBounds: olExtent;
    spatialBoundsText: string = "";
    availableKeywords: string[] = [];   // List of available keywords
    selectedKeywords: string[] = [""];  // Chosen keywords for filtering
    availableServices: any = [];
    dateTo: any = null;
    dateFrom: any = null;
    availableRegistries: any = [];


    @ViewChild('instance') typeaheadInstance: NgbTypeahead;
    click$ = new Subject<string>();
    searchKeywords = (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            //.merge(this.focus$)
            .merge(this.click$.filter(() => !this.typeaheadInstance.isPopupOpen()))
            .map(term => (term === '' ? this.availableKeywords : this.availableKeywords.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10));


    constructor(private olMapService: OlMapService,
        private userStateService: UserStateService,
        private cswSearchService: CSWSearchService,
        private modalService: NgbModal) { }


    ngOnInit() {
        //this.userStateService.setView(DATA_VIEW);

        // Load available registries
        this.cswSearchService.getAvailableRegistries().subscribe(data => {
            this.availableRegistries = data;
            for (let registry of this.availableRegistries) {
                registry.checked = true;
                registry.startIndex = 1;
                registry.prevIndices = [];
            }
            // Populate initial results (if this isn't desired, add checks to
            // facetedSearch to ensure at least 1 filter has been used or de-
            // selecting a registry will populate results)
            this.facetedSearch();
            this.getFacetedKeywords();
        }, error => {
            // TODO: Proper error reporting
            console.log("Unable to retrieve registries: " + error.message);
        });

        // Define available services
        this.availableServices = [
            { 'id': 'wcs', 'name': 'WCS', 'checked': false },
            { 'id': 'ncss', 'name': 'NCSS', 'checked': false },
            { 'id': 'opendap', 'name': 'OPeNDAP', 'checked': false },
            { 'id': 'wfs', 'name': 'WFS', 'checked': false },
            { 'id': 'wms', 'name': 'WMS', 'checked': false }];
    }


    ngAfterViewChecked() {
        this.userStateService.setView(DATA_VIEW);
    }


    /**
     * Search results based on the current faceted search panel values
     */
    public facetedSearch(): void {
        this.cswSearchResults = [];

        // Limit
        const limit = this.CSW_RECORD_PAGE_LENGTH;

        // Available registries and start
        let serviceIds: string[] = [];
        let starts: number[] = [];
        let registrySelected: boolean = false;
        this.availableRegistries.forEach(registry => {
            if (registry.checked) {
                registrySelected = true;
                serviceIds.push(registry.id);
                starts.push(registry.startIndex);
            }
        });
        // If no registries are selected, there's nothing to search
        if (!registrySelected)
            return;

        let fields: string[] = [];
        let values: string[] = [];
        let types: string[] = [];
        let comparisons: string[] = [];

        // Any text search
        if (this.anyTextValue) {
            fields.push('anytext');
            values.push(this.anyTextValue);
            types.push('string');
            comparisons.push('eq');
        }

        // Spatial bounds
        if (this.spatialBounds != null) {
            fields.push('bbox');
            let boundsStr = '{"northBoundLatitude":' + this.spatialBounds[3] +
                ',"southBoundLatitude":' + this.spatialBounds[1] +
                ',"eastBoundLongitude":' + this.spatialBounds[2] +
                ',"westBoundLongitude":' + this.spatialBounds[0] +
                ',"crs":"EPSG:4326"}';
            values.push(boundsStr);
            types.push('bbox');
            comparisons.push('eq');
        }

        // Keywords
        this.selectedKeywords.forEach(keyword => {
            if (keyword != '') {
                fields.push('keyword');
                values.push(keyword);
                types.push('string');
                comparisons.push('eq');
            }
        });

        // Available services
        for (let service of this.availableServices) {
            if (service.checked) {
                fields.push('servicetype');
                values.push(service.name);
                types.push('servicetype');
                comparisons.push('eq');
            }
        }

        // Publication dates
        if (this.dateFrom != null && this.dateTo != null) {
            fields.push('datefrom');
            fields.push('dateto');
            let fromDate = Date.parse(this.dateFrom.year + '-' + this.dateFrom.month + '-' + this.dateFrom.day);
            let toDate = Date.parse(this.dateTo.year + '-' + this.dateTo.month + '-' + this.dateTo.day);
            values.push(fromDate.toString());
            values.push(toDate.toString());
            types.push('date');
            types.push('date');
            comparisons.push('gt');
            comparisons.push('lt');
        }

        this.recordsLoading = true;
        this.cswSearchService.getFacetedSearch(starts, limit, serviceIds, fields, values, types, comparisons)
            .subscribe(response => {
                for (let registry of this.availableRegistries) {
                    registry.prevIndices.push(registry.startIndex);
                    registry.startIndex = response.nextIndexes[registry.id];
                }
                this.cswSearchResults = response.records;
                this.recordsLoading = false;
            }, error => {
                // TODO: proper error reporting
                console.log("Faceted search error: " + error.message);
                this.recordsLoading = false;
            });
    }


    /**
     * 
     */
    public getFacetedKeywords(): void {
        let registrySelected: boolean = false;
        let serviceIds = [];
        for (let registry of this.availableRegistries) {
            if (registry.checked) {
                registrySelected = true;
                serviceIds.push(registry.id);
            }
        }
        // If no registries are selected, there's nothing to search
        if (!registrySelected)
            return;
        this.cswSearchService.getFacetedKeywords(serviceIds).subscribe(data => {
            this.availableKeywords = data;
        }, error => {
            // TODO: Proper error reporting
            console.log("Faceted keyword error: " + error.message);
        });
    }


    /**
     * 
     */
    public resetFacetedSearch(): void {
        this.currentCSWRecordPage = 1;
        // Reset registry start and previous indices
        for (let registry of this.availableRegistries) {
            registry.startIndex = 1;
            registry.prevIndices = [];
        }
        this.facetedSearch();
    }


    /**
     * Fires when a registry is changed, resets keywords and re-runs facted search.
     */
    public registryChanged(): void {
        this.getFacetedKeywords();
        this.resetFacetedSearch();
    }


    /**
     * Are there more results to display?
     * 
     * @returns true if at least one registry has (nextIndex > 0), false
     *          otherwise
     */
    public hasNextResultsPage(): boolean {
        for (let registry of this.availableRegistries) {
            if (registry.startIndex != 0) {
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
            for (let registry of this.availableRegistries) {
                if (registry.prevIndices.length >= 2) {
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
        try {
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
            const modelRef = this.modalService.open(RecordModalContent, {size: 'lg'});
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
     * TODO: Limit map zoom out. Getting some unusual results if zooming out
     * too far, probably due to going past the limits of the defined EPSG.
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
     * Re-run faceted search whenpublication dates change
     */
    public publicationDateChanged(): void {
        if (this.isValidDate(this.dateFrom) && this.isValidDate(this.dateTo)) {
            this.resetFacetedSearch();
        }
    }


    /**
     * Add a new empty keyword to the end of the list so that an empty
     * typeahead is added to the UI
     */
    public addNewKeyword(): void {
        this.selectedKeywords.push("");
    }


    /**
     * Fires when a new keyword is selected from a keyword typeahead
     * 
     * @param index index of the typeahead from which a selection was made
     * @param $event allows us to get the typeahead selection
     */
    public keywordSelected(index: number, $event): void {
        if ($event.item != null && $event.item != "" && !(this.selectedKeywords.some(k => k == $event.item))) {
            this.selectedKeywords[index] = $event.item;
            this.resetFacetedSearch();
        }
    }


    /**
     * Remove a selected keyword
     * 
     * @param index 
     */
    public removeKeyword(index: number): void {
        this.selectedKeywords.splice(index, 1);
        if (this.selectedKeywords.length == 0) {
            // If no keywords, push a new empty keyword
            this.selectedKeywords.push("");
        }
        this.resetFacetedSearch();
    }


    /**
     * Get service information
     * 
     * @param id the ID of the service
     */
    public getService(id: string): any {
        return this.availableServices.find(s => s.id === id);
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

}
