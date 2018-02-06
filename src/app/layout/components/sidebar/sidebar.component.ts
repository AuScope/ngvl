import { environment } from '../../../../environments/environment';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { LayerModel } from 'portal-core-ui/model/data/layer.model';
import { LayerHandlerService } from 'portal-core-ui/service/cswrecords/layer-handler.service';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  isActive: boolean = false;
  showMenu: string = '';
  cswRecords = [];

  constructor(private layerHandlerService: LayerHandlerService, private olMapService: OlMapService,  private httpClient: HttpClient) {

  }

  ngOnInit(): void {
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

  public addCSWRecord(cswRecord: CSWRecordModel) {
    this.olMapService.addCSWRecord(cswRecord);
  }

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
