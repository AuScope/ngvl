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


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  isActive: boolean = false;
  showMenu: string = '';
  cswRecords = [];

  // Datasets collapsable menus
  anyTextIsCollapsed: boolean = true;
  spatialBoundsIsCollapsed: boolean = true;
  keywordsIsCollapsed: boolean = true;
  servicesIsCollapsed: boolean = true;
  pubDateIsCollapsed: boolean = true;
  registriesIsCollapsed: boolean = true;
  searchResultsIsCollapsed: boolean = true;

  spatialBounds: olExtent;
  spatialBoundsText: string = "";
  anyTextValue: string= "";


  constructor(private layerHandlerService: LayerHandlerService, private olMapService: OlMapService,
              private httpClient: HttpClient, private cswSearchService: CSWSearchService) {
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
  }

  eventCalled() {
    this.isActive = !this.isActive;
  }


  /**
   * TODO: Add spinner to results panel
   */
  public facetedSearch() {
    let httpParams = new HttpParams();
    // TODO: Get proper service IDs and implement pagination (start/limit)
    httpParams = httpParams.append('serviceId', 'cswNCI');
    httpParams = httpParams.append('limit', '10');

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

    this.httpClient.post(environment.portalBaseUrl + 'facetedCSWSearch.do', httpParams.toString(), {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
        responseType: 'json'
        }).subscribe(response => {
            this.cswRecords = response['data'].records;
        });
  }


  /**
   * TODO: Add loading spinner to results panel
   */
  /*
  public anyTextSearch() {
      // TODO: Pagination, currently limited to 1st 10 results
    if(this.anyTextValue) {
        let httpParams = new HttpParams();
        httpParams = httpParams.append('serviceId', 'cswNCI');
        httpParams = httpParams.append('limit', '10');
        httpParams = httpParams.append('field', 'anytext');
        httpParams = httpParams.append('value', this.anyTextValue);
        httpParams = httpParams.append('type', 'string');
        httpParams = httpParams.append('comparison', 'eq');
        this.httpClient.post(environment.portalBaseUrl + 'facetedCSWSearch.do', httpParams.toString(), {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
        responseType: 'json'
        }).subscribe(response => {
            this.cswRecords = response['data'].records;
        });
    }
  }
  */


  /**
   * 
   * @param cswRecord 
   */
  public addCSWRecord(cswRecord: CSWRecordModel) {
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
  public showCSWRecordInformation(cswRecord: CSWRecordModel) {

  }


  /**
   * 
   * @param cswRecord 
   */
  public showCSWRecordBounds(cswRecord: CSWRecordModel) {
    if(cswRecord.geographicElements.length > 0) {
        let bounds = cswRecord.geographicElements.find(i => i.type === 'bbox');
        const bbox: [number, number, number, number] =
            [bounds.westBoundLongitude, bounds.southBoundLatitude, bounds.eastBoundLongitude, bounds.northBoundLatitude];
        const extent: olExtent = olProj.transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
        this.olMapService.showBounds(extent);
      }
  }


  /**
   * 
   * @param cswRecord 
   */
  public zoomToCSWRecordBounds(cswRecord: CSWRecordModel) {
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
  public drawBound() {
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
  public drawSpatialBounds() {
    this.olMapService.drawBound().subscribe((vector) => {
        this.spatialBounds = olProj.transformExtent(vector.getSource().getExtent(), 'EPSG:3857', 'EPSG:4326');
        this.updateSpatialBoundsText(this.spatialBounds);
        this.facetedSearch();
      });
  }


  /**
   * 
   */
  public spatialBoundsFromMap() {
    this.spatialBounds = olProj.transformExtent(this.olMapService.getMapBounds(), 'EPSG:3857', 'EPSG:4326');
    this.updateSpatialBoundsText(this.spatialBounds);
    this.facetedSearch();

  }

  public updateSpatialBoundsText(extent: olExtent) {
    let w = extent[3].toFixed(4);
    let n = extent[0].toFixed(4);
    let s = extent[1].toFixed(4);
    let e = extent[2].toFixed(4);
    this.spatialBoundsText = w + ", " + n + " to " + s + ", " + e;
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