import { Component, Input, ViewChild } from '@angular/core';
import { DownloadOptions, JobDownload } from '../../shared/modules/vgl/models';
import { DownloadOptionsModalContent } from './download-options.modal.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TreeNode } from 'primeng/api';
import { UserStateService } from '../../shared';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { CSWSearchService } from '../../shared/services/csw-search.service';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';


@Component({
    selector: 'confirm-datasets-modal-content',
    templateUrl: './confirm-datasets.modal.component.html',
    styleUrls: ['./confirm-datasets.modal.component.scss']
})


export class ConfirmDatasetsModalContent {

    // TreeData, columns and selection
    @Input() public cswRecordTreeData: TreeNode[] = [];
    treeCols: any[] = [
        { field: 'name', header: 'Name', colStyle: { 'width': '40%' } },
        { field: 'url', header: 'URL', colStyle: { 'width': '40%' } },
        { header: 'Download', colStyle: { 'width': '20%' } }
    ];
    selectedDatasetNodes: TreeNode[] = [];

    // Keep track of no. of downloads across types
    capturedJobDownloadCount: number = 0;

    // Selections saved dialog
    @ViewChild('selectedDatasetsOkModal') public selectedDatasetsOkModal;

    constructor(public activeModal: NgbActiveModal,
        private modalService: NgbModal,
        private vglService: VglService,
        private userStateService: UserStateService,
        private cswSearchService: CSWSearchService) { }


    /**
     * TODO: This lazily opens the download URL in a new window, so this won't
     * work on mobile devices
     * 
     * @param onlineResource 
     * @param dlOptions 
     */
    private downloadDataset(onlineResource: any, dlOptions: DownloadOptions): void {
        switch (onlineResource.type) {
            case 'WCS':
                //Unfortunately ERDDAP requests that extend beyond the spatial bounds of the dataset
                //will fail. To workaround this, we need to crop our selection to the dataset bounds
                if (dlOptions.dsEastBoundLongitude != null && (dlOptions.dsEastBoundLongitude < dlOptions.eastBoundLongitude)) {
                    dlOptions.eastBoundLongitude = dlOptions.dsEastBoundLongitude;
                }
                if (dlOptions.dsWestBoundLongitude != null && (dlOptions.dsWestBoundLongitude > dlOptions.westBoundLongitude)) {
                    dlOptions.westBoundLongitude = dlOptions.dsWestBoundLongitude;
                }
                if (dlOptions.dsNorthBoundLatitude != null && (dlOptions.dsNorthBoundLatitude < dlOptions.northBoundLatitude)) {
                    dlOptions.northBoundLatitude = dlOptions.dsNorthBoundLatitude;
                }
                if (dlOptions.dsSouthBoundLatitude != null && (dlOptions.dsSouthBoundLatitude > dlOptions.southBoundLatitude)) {
                    dlOptions.southBoundLatitude = dlOptions.dsSouthBoundLatitude;
                }
                this.vglService.makeErddapUrl(dlOptions).subscribe(
                    response => {
                        if (response.url) {
                            window.open(response.url);
                        }
                    }, error => {
                        console.log(error.message);
                    }
                );
                break;
            case 'WFS':
                this.vglService.makeWfsUrl(dlOptions).subscribe(
                    response => {
                        if (response.url) {
                            window.open(response.url);
                        }
                    }, error => {
                        console.log(error.message);
                    }
                );
                break;
            case 'NCSS':
                this.vglService.makeNetcdfsubseserviceUrl(dlOptions).subscribe(
                    response => {
                        if (response.url) {
                            window.open(response.url);
                        }
                    }, error => {
                        console.log(error.message);
                    }
                );
                break;
            default:
                this.vglService.makeDownloadUrl(dlOptions).subscribe(
                    response => {
                        if (response.url) {
                            window.open(response.url);
                        }
                    }, error => {
                        console.log(error.message);
                    }
                );
                break;
        }
    }


    /**
     * Edit the download options for the resource.
     * If the record is book marked and has saved options, loads the downloadoptions from DB 
     * 
     * TODO: Do
     */
    public editDownload(onlineResource: any, cswRecord: CSWRecordModel, defaultOptions: DownloadOptions, downloadOptions: DownloadOptions): void {
        event.stopPropagation();
        const modelRef = this.modalService.open(DownloadOptionsModalContent, { size: 'lg' });
        //  const modelRef = this.modalService.open(DownloadOptionsModalContent,  { windowClass : "myCustomModalClass"});  
        modelRef.componentInstance.cswRecord = cswRecord;
        modelRef.componentInstance.onlineResource = onlineResource;
        let isBookMarkRecord: boolean = this.cswSearchService.isBookMark(cswRecord);
        modelRef.componentInstance.isBMarked = isBookMarkRecord;
        modelRef.componentInstance.defaultDownloadOptions = defaultOptions;
        if (isBookMarkRecord) {
            this.cswSearchService.getDownloadOptions(cswRecord).subscribe(data => {
                modelRef.componentInstance.bookmarkOptions = data;
            });
            defaultOptions.bookmarkOptionName = 'Default Options';
            modelRef.componentInstance.dropDownItems.push({ label: 'Default Options', value: defaultOptions });           
            if (modelRef.componentInstance.bookmarkOptions && modelRef.componentInstance.bookmarkOptions.length > 0) {
                console.log("THE BOOK MARK OPTIONS ARE PRESENT");
                modelRef.componentInstance.bookmarkOptions.forEach(option => {
                    modelRef.componentInstance.dropDownItems.push({ label: option.bookmarkOptionName, value: option });
                });
            }
            else
            console.log("THE BOOK MARK OPTIONS ARE NOT PRESENT");            
        }
        modelRef.componentInstance.downloadOptions = downloadOptions;
    }
    /**
     * Checks if the Book mark stored in DB has saved download options data 
     * @param savedDwnldOptions 
     */
    private areOptionsStored(savedDwnldOptions: DownloadOptions) {
        return ((savedDwnldOptions.url && savedDwnldOptions.url.length != 0) ||
            (savedDwnldOptions.localPath && savedDwnldOptions.localPath.length != 0) ||
            (savedDwnldOptions.name && savedDwnldOptions.name.length != 0) ||
            (savedDwnldOptions.description && savedDwnldOptions.description.length != 0) ||
            (savedDwnldOptions.northBoundLatitude && savedDwnldOptions.northBoundLatitude != 0) ||
            (savedDwnldOptions.southBoundLatitude && savedDwnldOptions.southBoundLatitude != 0) ||
            (savedDwnldOptions.eastBoundLongitude && savedDwnldOptions.eastBoundLongitude != 0) ||
            (savedDwnldOptions.westBoundLongitude && savedDwnldOptions.westBoundLongitude != 0));
    }


    /**
     * 
     * @param onlineResource 
     * @param dlOptions 
     */
    private makeJobDownload(onlineResource: any, dlOptions: DownloadOptions): Observable<JobDownload> {
        switch (onlineResource.type) {
            case 'WCS':
                //Unfortunately ERDDAP requests that extend beyond the spatial bounds of the dataset
                //will fail. To workaround this, we need to crop our selection to the dataset bounds
                if (dlOptions.dsEastBoundLongitude != null && (dlOptions.dsEastBoundLongitude < dlOptions.eastBoundLongitude)) {
                    dlOptions.eastBoundLongitude = dlOptions.dsEastBoundLongitude;
                }
                if (dlOptions.dsWestBoundLongitude != null && (dlOptions.dsWestBoundLongitude > dlOptions.westBoundLongitude)) {
                    dlOptions.westBoundLongitude = dlOptions.dsWestBoundLongitude;
                }
                if (dlOptions.dsNorthBoundLatitude != null && (dlOptions.dsNorthBoundLatitude < dlOptions.northBoundLatitude)) {
                    dlOptions.northBoundLatitude = dlOptions.dsNorthBoundLatitude;
                }
                if (dlOptions.dsSouthBoundLatitude != null && (dlOptions.dsSouthBoundLatitude > dlOptions.southBoundLatitude)) {
                    dlOptions.southBoundLatitude = dlOptions.dsSouthBoundLatitude;
                }
                return this.vglService.makeErddapUrl(dlOptions);
            case 'WFS':
                return this.vglService.makeWfsUrl(dlOptions);
            case 'NCSS':
                return this.vglService.makeNetcdfsubseserviceUrl(dlOptions);
            default:
                return this.vglService.makeDownloadUrl(dlOptions);
        }
    }

    /**
     * User has selected to save the selected datasets
     * 
     * TODO: Don't reset selections every time, just add new selections
     */
    public captureData(): void {
        // Turn leaf selections into JobDownloads
        if (this.selectedDatasetNodes) {
            this.capturedJobDownloadCount = 0;
            let makeUrls = [];
            for (let record of this.selectedDatasetNodes) {
                if (record.data.leaf) {
                    if (record.data.onlineResource && record.data.downloadOptions) {
                        makeUrls.push(this.makeJobDownload(record.data.onlineResource, record.data.downloadOptions));
                    }
                }
            }
            if (makeUrls.length > 0) {
                forkJoin(makeUrls).subscribe(results => {
                    this.capturedJobDownloadCount = results.length;
                    // Persist data selections to user state service
                    for (let result of results) {
                        this.userStateService.addJobDownload(<JobDownload>result);
                    }
                    // Display selection OK modal
                    this.modalService.open(this.selectedDatasetsOkModal);
                    this.activeModal.close();
                }, error => {
                    // TODO: Better error reporting
                    console.log(error.message);
                });
            }
        }
    }

}
