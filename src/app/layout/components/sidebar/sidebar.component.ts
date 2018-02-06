import { environment } from '../../../../environments/environment';
import { CSWRecordModel } from '../../../shared/modules/portal-core-ui/model/data/cswrecord.model';
import { LayerModel } from '../../../shared/modules/portal-core-ui/model/data/layer.model';
import { LayerHandlerService } from '../../../shared/modules/portal-core-ui/service/cswrecords/layer-handler.service';
import { CSWSearchService } from '../../../shared/services/csw-search.service';
import { OlMapService } from '../../../shared/modules/portal-core-ui/service/openlayermap/ol-map.service';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Bbox } from '../../../shared/modules/portal-core-ui/model/data/bbox.model';

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
  cswRecords: CSWRecordModel[] = [];
  selectedCSWRecord = null;

  // Datasets collapsable menus
  anyTextIsCollapsed: boolean = true;
  spatialBoundsIsCollapsed: boolean = true;
  keywordsIsCollapsed: boolean = true;
  servicesIsCollapsed: boolean = true;
  pubDateIsCollapsed: boolean = true;
  registriesIsCollapsed: boolean = true;
  searchResultsIsCollapsed: boolean = true;

  anyTextValue: string= "";
  spatialBounds: olExtent;
  spatialBoundsText: string = "";
  dateTo: any=null;
  dateFrom: any=null;


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
    /* Initial test records
    let httpParams = new HttpParams();
    httpParams = httpParams.append('start', '1');
    httpParams = httpParams.append('serviceId', 'cswNCI');
    httpParams = httpParams.append('limit', '10');

    this.httpClient.post(environment.portalBaseUrl + 'facetedCSWSearch.do', httpParams.toString(), {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
      responseType: 'json'
    }).subscribe(response => {
      this.cswRecords = response['data'].records;
    });
    */
  }

  eventCalled() {
    this.isActive = !this.isActive;
  }


  /**
   * TODO: Add spinner to results panel
   */
  public facetedSearch(): void {
    this.cswRecords = [];
    let httpParams = new HttpParams();
    // TODO: Get proper service IDs and implement pagination (start/limit)
    httpParams = httpParams.append('serviceId', 'cswNCI');
    const start = ((this.currentCSWRecordPage - 1) * 10) + 1;
    httpParams = httpParams.append('start', start.toString());
    // Getting 1 more than desired length tells us if next page should be visible
    httpParams = httpParams.append('limit', (this.CSW_RECORD_PAGE_LENGTH + 1).toString());

    if(this.anyTextValue) {
        httpParams = httpParams.append('field', 'anytext');
        httpParams = httpParams.append('value', this.anyTextValue);
        httpParams = httpParams.append('type', 'string');
        httpParams = httpParams.append('comparison', 'eq');
    }

    if(this.spatialBounds != null) {
        httpParams = httpParams.append('field', 'bbox');
        let boundsStr = '{"northBoundLatitude":'+this.spatialBounds[3]+
                        ',"southBoundLatitude":'+this.spatialBounds[1]+
                        ',"eastBoundLongitude":'+this.spatialBounds[2]+
                        ',"westBoundLongitude":'+this.spatialBounds[0]+
                        ',"crs":"EPSG:4326"}';
        httpParams = httpParams.append('value', boundsStr);
        httpParams = httpParams.append('type', 'bbox');
        httpParams = httpParams.append('comparison', 'eq');
    }
    
    if(this.dateFrom != null && this.dateTo != null) {
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

    this.httpClient.post(environment.portalBaseUrl + 'facetedCSWSearch.do', httpParams.toString(), {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
        responseType: 'json'
        }).subscribe(response => {
            this.cswRecords = response['data'].records;
            // TODO: Ensure results visible if dropwdown not expanded
        });
  }


  /**
   * 
   */
  public resetFacetedSearch(): void {
      this.currentCSWRecordPage = 1;
      this.facetedSearch();
  }


  /**
   * 
   */
  public previousResultsPage(): void {
    if(this.currentCSWRecordPage != 1) {
        this.currentCSWRecordPage -= 1;
        this.facetedSearch();
    }
  }


  /**
   * 
   */
  public nextResultsPage(): void {
    if(this.cswRecords.length == this.CSW_RECORD_PAGE_LENGTH + 1) {
        this.currentCSWRecordPage += 1;
        this.facetedSearch();
    }
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
    this.olMapService.removeLayerById(recordId);
  }


  /**
   * 
   * @param cswRecord 
   */
  public showCSWRecordInformation(cswRecordModal, cswRecord): void {
      if(cswRecord) {
        this.selectedCSWRecord = cswRecord;
        this.modalService.open(cswRecordModal);
      }
  }


  /**
   * 
   * @param cswRecord 
   */
  public showCSWRecordBounds(cswRecord: CSWRecordModel): void {
    if(cswRecord.geographicElements.length > 0) {
        let bounds = cswRecord.geographicElements.find(i => i.type === 'bbox');
        const bbox: [number, number, number, number] =
            [bounds.westBoundLongitude, bounds.southBoundLatitude, bounds.eastBoundLongitude, bounds.northBoundLatitude];
        const extent: olExtent = olProj.transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
        this.olMapService.displayBounds(extent);
      }
  }


  /**
   * 
   * @param cswRecord 
   */
  public zoomToCSWRecordBounds(cswRecord: CSWRecordModel): void {
      if(cswRecord.geographicElements.length > 0) {
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
      features.forEach(function(feature) {

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
    this.spatialBounds = olProj.transformExtent(this.olMapService.getMapBounds(), 'EPSG:3857', 'EPSG:4326');
    this.updateSpatialBoundsText(this.spatialBounds);
    this.resetFacetedSearch();

  }

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
      if(this.isValidDate(this.dateFrom) && this.isValidDate(this.dateTo)) {
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
      if(date && date.year && date.month)
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