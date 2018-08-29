import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { BookMark } from '../../shared/modules/vgl/models';
import { RecordModalContent } from './record.modal.component';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { CSWSearchService } from '../../shared/services/csw-search.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import olProj from 'ol/proj';
import olExtent from 'ol/extent';


// List of valid online resource types that can be added to the map
const VALID_ONLINE_RESOURCE_TYPES: string[] = ['WMS', 'WFS', 'CSW', 'WWW'];

@Component({
    selector: 'app-datasets-display',
    templateUrl: './datasets-display.component.html',
    styleUrls: ['./datasets-display.component.scss']    
})
export class DatasetsDisplayComponent {

    @Input() registries: any = [];
    @Input() cswRecordList: CSWRecordModel[] = [];    
    @Input() bookMarkList: BookMark[] = []; 
    @Input() validUser = false;
    
    @Output() bookMarkChoice = new EventEmitter();   

    constructor(private olMapService: OlMapService,
        private cswSearchService: CSWSearchService,        
        private modalService: NgbModal) { }

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
     * Determine if a CSWRecord meets the criteria to be added to the map:
     * 
     *   1. Has online resource.
     *   2. Has at least one defined geographicElement.
     *   3. Layer does not already exist on map.
     *   4. One online resource is of type WMS, WFS, CSW or WWW.
     * 
     * @param cswRecord the CSWRecord to verify
     * @return true is CSWRecord can be added, false otherwise
     */
    public canRecordBeAdded(cswRecord: CSWRecordModel): boolean {
        return cswRecord.hasOwnProperty('onlineResources') &&
               cswRecord.onlineResources.length > 0 &&
               cswRecord.geographicElements.length > 0 &&
               !this.olMapService.layerExists(cswRecord.id) &&
               cswRecord.onlineResources.some(resource => VALID_ONLINE_RESOURCE_TYPES.indexOf(resource.type) > -1);
    }
}
