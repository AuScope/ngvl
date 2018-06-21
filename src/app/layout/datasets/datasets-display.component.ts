import { Component, OnInit, Input } from '@angular/core';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { ANONYMOUS_USER } from '../../shared/modules/vgl/models';
import { RecordModalContent } from './record.modal.component';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { CSWSearchService } from '../../shared/services/csw-search.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, UserStateService } from '../../shared';
import olProj from 'ol/proj';
import olExtent from 'ol/extent';


@Component({
  selector: 'app-datasets-display',
  templateUrl: './datasets-display.component.html',
  styleUrls: ['./datasets-display.component.scss']
})
export class DatasetsDisplayComponent implements OnInit {
  
  @Input() registries: any = [];
  @Input() cswRecordList: CSWRecordModel[] = [];
  
  constructor(private olMapService: OlMapService,
    private cswSearchService: CSWSearchService,
    private userStateService: UserStateService,
    private authService: AuthService,
    private modalService: NgbModal) { }

  ngOnInit() {
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
          const modelRef = this.modalService.open(RecordModalContent, { size: 'lg' });
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

  private isValidUser(): boolean {
    let userName: string;
    this.userStateService.user.subscribe(user => {
        userName = user.fullName;
    });
    return (this.authService.isLoggedIn && (userName.search(ANONYMOUS_USER.fullName) == -1));
}

}
