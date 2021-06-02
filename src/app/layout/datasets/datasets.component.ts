import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

import { routerTransition } from '../../router.animations';
import { AuthService, UserStateService, DATA_VIEW } from '../../shared';
import { CSWSearchService } from '../../shared/services/csw-search.service';

import { CSWRecordModel, LayerModel, OlMapService } from '@auscope/portal-core-ui';
import { BookMark, Registry } from '../../shared/modules/vgl/models';
import * as Proj from 'ol/proj';

import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'app-datasets',
    templateUrl: './datasets.component.html',
    styleUrls: ['./datasets.component.scss'],
    animations: [routerTransition()]
})
export class DatasetsComponent implements OnInit, AfterViewChecked {

    readonly CSW_RECORD_PAGE_LENGTH = 10;

    // Search results
    cswSearchResults: Map<String, CSWRecordModel[]> = new Map<String, CSWRecordModel[]>();
    layerOpacities: Map<String, number> = new Map<String, number>();

    // BookMarks
    bookMarks: BookMark[] = [];
    bookMarkCSWRecords: CSWRecordModel[] = [];

    // Active tab (will initialize tab selection after bookmarks tab removed on logout)
    activeNavId: number = 1;

    // Collapsable menus
    anyTextIsCollapsed: boolean = true;
    spatialBoundsIsCollapsed: boolean = true;
    keywordsIsCollapsed: boolean = true;
    servicesIsCollapsed: boolean = true;
    pubDateIsCollapsed: boolean = true;
    registriesIsCollapsed: boolean = true;
    searchResultsIsCollapsed: boolean = true;

    // Collapsable active layer panel
    activeLayersIsCollapsed: boolean = true;

    // Faceted search parameters
    anyTextValue: string = "";
    spatialBounds: ol.Extent;
    spatialBoundsText: string = "";
    availableKeywords: string[] = [];   // List of available keywords
    selectedKeywords: string[] = [""];  // Chosen keywords for filtering
    availableServices: any = [];
    dateTo: Date = null;
    dateFrom: Date = null;
    availableRegistries: Map<String, Registry> = new Map<String, Registry>();

    currentYear: number;

    @ViewChild('instance') typeaheadInstance: NgbTypeahead;
    @ViewChild('searchResults') searchResultsElement: ElementRef;

    click$ = new Subject<string>();
    searchKeywords = (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            // .merge(this.focus$)
            .merge(this.click$.filter(() => !this.typeaheadInstance.isPopupOpen()))
            .map(term => (term === '' ? this.availableKeywords : this.availableKeywords.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))

    constructor(private olMapService: OlMapService,
        private userStateService: UserStateService,
        private cswSearchService: CSWSearchService,
        private authService: AuthService) { }

    ngOnInit() {
        this.userStateService.setView(DATA_VIEW);
        this.currentYear = (new Date()).getFullYear();
        // Load available registries
        this.cswSearchService.updateRegistries().subscribe((data: Registry[]) => {
            // Update registries
            for (let registry of data) {
                registry.checked = true;
                registry.startIndex = 1;
                registry.prevIndices = [];
                registry.recordsMatched = 0;
                registry.searching = false;
                registry.currentPage = 1;
                this.availableRegistries.set(registry.id, registry);
            }

            // Populate initial results (if this isn't desired, add checks to
            // facetedSearch to ensure at least 1 filter has been used or de-
            // selecting a registry will populate results)
            this.getFacetedKeywords();
            this.facetedSearchAllRegistries();

            // get bookmark data only if the user is logged in
            if (this.isValidUser()) {
                this.getBookMarkCSWRecords();
            }

            this.authService.userLoggedOut.subscribe(logOut => {
                if (logOut) {
                    this.activeNavId = 1;
                }
            });
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

        this.anyTextIsCollapsed = false;
        this.searchResultsIsCollapsed = false;
    }

    ngAfterViewChecked() {
        this.userStateService.setView(DATA_VIEW);
    }

    /**
     *
     * @param serviceId
     */
    public getRegistryTabTitle(serviceId: String) {
        let title: String = this.availableRegistries.get(serviceId).title;
        if (this.availableRegistries.get(serviceId).searching) {
            title += " (Searching)";
        } else if (this.availableRegistries.get(serviceId).recordsMatched) {
            title += " (" + this.availableRegistries.get(serviceId).recordsMatched + ")";
        }
        return title;
    }

    /**
     *
     */
    public getTotalSearchResultCount(): number {
        let count: number = 0;
        this.availableRegistries.forEach((registry: Registry) => {
            count += registry.recordsMatched;
        });
        return count;
    }

    /**
     * Search all registries using current facets.
     */
    public facetedSearchAllRegistries(): void {
        // Available registries and start
        let serviceIds: string[] = [];
        let starts: number[] = [];
        let registrySelected: boolean = false;
        this.availableRegistries.forEach((registry: Registry, serviceId: String) => {
            if (registry.checked) {
                registrySelected = true;
                serviceIds.push(registry.id);
                starts.push(registry.startIndex);
            }
        });

        // If no registries are selected, there's nothing to search
        if (!registrySelected) {
            return;
        }

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
            if (keyword !== '') {
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
            // For some reason getMilliseconds doesn't work on these Date objects,
            // so parse from string
            let fromDate = Date.parse(this.dateFrom.toString());
            let toDate = Date.parse(this.dateTo.toString());
            values.push(fromDate.toString());
            values.push(toDate.toString());
            types.push('date');
            types.push('date');
            comparisons.push('gt');
            comparisons.push('lt');
        }

        this.availableRegistries.forEach((registry: Registry, serviceId: String) => {
            if (registry.checked) {
                registry.searching = true;
                registry.searchError = null;
                this.cswSearchService.getFacetedSearch(registry.id, registry.startIndex, this.CSW_RECORD_PAGE_LENGTH, fields, values, types, comparisons)
                .subscribe(response => {
                    registry.prevIndices.push(registry.startIndex);
                    registry.startIndex = response.nextIndexes[registry.id];
                    registry.recordsMatched = response.recordsMatched;
                    if (response.hasOwnProperty('searchErrors') && response.searchErrors[registry.id] != null) {
                        registry.searchError = response.searchErrors[registry.id];
                    }
                    this.cswSearchResults.set(registry.id, response.records);
                    registry.searching = false;

                    this.searchResultsIsCollapsed = false;
                    // this.searchResultsElement.nativeElement.scrollIntoView(false);
                }, error => {
                    this.cswSearchResults.set(serviceId, null);
                    registry.searching = false;
                });
            }
        });
    }

    /**
     * Search a single registry using current facets.
     * @param registry the single registry to search
     */
    public facetedSearchSingleRegistry(registry: Registry): void {
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
            if (keyword !== '') {
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
            // For some reason getMilliseconds doesn't work on these Date objects,
            // so parse from string
            let fromDate = Date.parse(this.dateFrom.toString());
            let toDate = Date.parse(this.dateTo.toString());
            values.push(fromDate.toString());
            values.push(toDate.toString());
            types.push('date');
            types.push('date');
            comparisons.push('gt');
            comparisons.push('lt');
        }

        registry.searching = true;
        registry.searchError = null;

        this.cswSearchService.getFacetedSearch(registry.id, registry.startIndex, this.CSW_RECORD_PAGE_LENGTH, fields, values, types, comparisons).subscribe(response => {
            registry.prevIndices.push(registry.startIndex);
            registry.startIndex = response.nextIndexes[registry.id];
            registry.recordsMatched = response.recordsMatched;
            if ((<CSWRecordModel[]>response.records).length > 0) {
                this.cswSearchResults.set(registry.id, response.records);
            }
            if (response.searchErrors && response.searchErrors.length > 0) {
                registry.searchError = response.searchErrors[registry.id];
            }
            registry.searching = false;
            this.searchResultsIsCollapsed = false;
            // this.searchResultsElement.nativeElement.scrollIntoView(false);
        }, error => {
            this.cswSearchResults.set(registry.id, null);
            registry.searchError = error.message;
            registry.searching = false;
        });
    }

    /**
     *
     */
    public getFacetedKeywords(): void {
        let registrySelected: boolean = false;
        let serviceIds = [];
        this.availableRegistries.forEach((registry: Registry, serviceId: String) => {
            if (registry.checked) {
                registrySelected = true;
                serviceIds.push(registry.id);
            }
        });
        // If no registries are selected, there's nothing to search
        if (!registrySelected) {
            return;
        }
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
        // Reset results and registry indices
        this.cswSearchResults = new Map<String, CSWRecordModel[]>();
        this.availableRegistries.forEach((registry: Registry, serviceId: String) => {
            registry.startIndex = 1;
            registry.prevIndices = [];
            registry.currentPage = 1;
        });
        this.facetedSearchAllRegistries();
    }

    /**
     * Fires when a registry is changed, resets keywords and re-runs facted
     * search if registry has been added, as well as resetting search indices.
     */
    public registryChanged(registry: Registry): void {
        this.getFacetedKeywords();
        if (registry.checked) {
            this.facetedSearchSingleRegistry(registry);
        } else {
            registry.currentPage = 1;
            registry.startIndex = 1;
            registry.prevIndices = [];
            registry.recordsMatched = 0;
            if (this.cswSearchResults.has(registry.id)) {
                this.cswSearchResults.delete(registry.id);
            }
        }
    }

    /**
     *
     */
    public drawBound(): void {
        this.olMapService.drawBound().subscribe((vector) => {
            const features = vector.getSource().getFeatures();
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
            this.spatialBounds = Proj.transformExtent(vector.getSource().getExtent(), 'EPSG:3857', 'EPSG:4326');
            this.updateSpatialBoundsText(this.spatialBounds);
            this.resetFacetedSearch();
        });
    }

    /**
     *
     */
    public spatialBoundsFromMap(): void {
        this.spatialBounds = Proj.transformExtent(this.olMapService.getMapExtent(), 'EPSG:3857', 'EPSG:4326');
        this.updateSpatialBoundsText(this.spatialBounds);
        this.resetFacetedSearch();
    }

    /**
     *
     * @param extent
     */
    public updateSpatialBoundsText(extent: ol.Extent): void {
        let w = extent[3].toFixed(4);
        let n = extent[0].toFixed(4);
        let s = extent[1].toFixed(4);
        let e = extent[2].toFixed(4);
        this.spatialBoundsText = w + ", " + n + " to " + s + ", " + e;
    }

    /**
     * Re-run faceted search when publication dates change
     */
    public publicationDateChanged(): void {
        if (this.isValidDate(this.dateFrom) && this.isValidDate(this.dateTo)) {
            console.log("Valid dates, searching...");
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
        if ($event.item != null && $event.item !== "" && !(this.selectedKeywords.some(k => k === $event.item))) {
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
        if (this.selectedKeywords.length === 0) {
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
    * Are there more results to display?
    *
    * @returns true if at least one registry has (nextIndex > 0), false
    *          otherwise
    */
    public hasNextResultsPage(serviceId: String): boolean {
        if (this.availableRegistries.get(serviceId).startIndex !== 0 && this.availableRegistries.get(serviceId).startIndex !== 1) {
            return true;
        }
        return false;
    }

    /**
     *
     */
    public previousResultsPage(serviceId: String): void {
        if (this.availableRegistries.get(serviceId).currentPage !== 1) {
            this.availableRegistries.get(serviceId).currentPage -= 1;
            if (this.availableRegistries.get(serviceId).prevIndices.length >= 2) {
                this.availableRegistries.get(serviceId).startIndex = this.availableRegistries.get(serviceId).prevIndices[this.availableRegistries.get(serviceId).prevIndices.length - 2];
                this.availableRegistries.get(serviceId).prevIndices.splice(this.availableRegistries.get(serviceId).prevIndices.length - 2, 2);
            }
            this.facetedSearchSingleRegistry(this.availableRegistries.get(serviceId));
        }
    }

    /**
     *
     */
    public nextResultsPage(serviceId: String): void {
        this.availableRegistries.get(serviceId).currentPage += 1;
        this.facetedSearchSingleRegistry(this.availableRegistries.get(serviceId));
    }

    /**
     * TODO: Maybe switch event to lose focus, this will check after every key press.
     *       Tried to use (change) but ngbDatepicker hijacks the event.
     * @param date
     */
    private isValidDate(date): boolean {
        if (date && date.getYear() && date.getMonth()) {
            return true;
        }
        return false;
    }

    /**
     * Check if the user is logged in and not anonymous
     */
    isValidUser(): boolean {
        return this.authService.isLoggedIn;
    }

    /**
     * get user's information for book marks and book marked csw records
     */
    public getBookMarkCSWRecords() {
        this.userStateService.bookmarks.subscribe(data => {
            this.bookMarks = data;
            let newBookMarkCSWRecords: CSWRecordModel[] = [];
            this.bookMarks.forEach(bookMark => {
                this.cswSearchService.getFilteredCSWRecord(bookMark.fileIdentifier, bookMark.serviceId).subscribe(response => {
                    if (response && response.length === 1) {
                        newBookMarkCSWRecords.push(response.pop());
                    }
                });
            });
            this.bookMarkCSWRecords = newBookMarkCSWRecords;
        }, error => {
            console.log(error.message);
        });
    }

    /**
     * processes the event emitted from the datasets-display component
     * by adding/removing from bookmarks and related csw records.
     * helps update the datasets-display component.
     *
     * @param selection
     */
    onBookMarkChoice(selection) {
        if (selection.choice === "add") {
            this.bookMarks.push(selection.bookmark);
            this.bookMarkCSWRecords.push(selection.cswRecord);
        } else if (selection.choice === "remove") {
            let index = this.bookMarks.findIndex(item => {
                return (item.id === selection.bookmark.id);
            });
            if (index > -1) {
                this.bookMarks.splice(index, 1);
            }
            let pos = this.bookMarkCSWRecords.findIndex(rec => {
                return (rec.id === selection.cswRecord.id);
            });
            if (pos > -1) {
                this.bookMarkCSWRecords.splice(pos, 1);
            }
        }
    }

    /**
     * TODO: This is used elsewhere, should make a map service method
     */
    public getActiveLayerCount(): number {
        return Object.keys(this.olMapService.getLayerModelList()).length;
    }

    /**
     * Get active layers
     */
    public getActiveLayers(): LayerModel[] {
        const layers: LayerModel[] = [];
        const keys = Object.keys(this.olMapService.getLayerModelList());
        for (let i = 0; i < keys.length; i++) {
            let currentLayer = this.olMapService.getLayerModelList()[keys[i]];
            layers.push(currentLayer);
            this.layerOpacities.set(currentLayer.id, 100);
        }
        return layers;
    }

    /* on Dragging of the gutter between map and datasets search input area resize the map */
    onDrag() {
          this.olMapService.updateSize();
    }

}
