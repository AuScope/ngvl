import { Component, Input, ViewChild } from '@angular/core';
import { DownloadOptions, DatasetDownloadModel } from '../../shared/modules/vgl/models';
import { DownloadOptionsModalContent } from './download-options.modal.component';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { OnlineResourceModel } from 'portal-core-ui/model/data/onlineresource.model';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TreeNode } from 'primeng/api';
import { TreeTable } from 'primeng/treetable';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { UserStateService } from '../../shared';
import { HttpParams } from '@angular/common/http';


@Component({
    selector: 'confirm-datasets-modal-content',
    templateUrl: './confirm-datasets.modal.component.html',
    styleUrls: ['./confirm-datasets.modal.component.scss']
})

export class ConfirmDatasetsModalContent {

    @Input() public cswRecordTreeData: TreeNode[] = [];
    selectedDatasetNodes: TreeNode[] = [];
    selectedLeafNodeCount: number = 0;
    @ViewChild('selectedDatasetsOkModal') public selectedDatasetsOkModal;


    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal,
                private vglService: VglService, private userStateService: UserStateService) { }


    /**
     * TODO: This lazily opens the download URL in a new window, so this won't
     * work for mobile devices
     * 
     * @param onlineResource 
     * @param dlOptions 
     */
    private downloadDataset(onlineResource: any, dlOptions: DownloadOptions): void {
        switch(onlineResource.type) {
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
                        if(response.url) {
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
                    if(response.url) {
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
                        if(response.url) {
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
                        if(response.url) {
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
     * Edit the download options for the resource
     * 
     * TODO: Do
     */
    public editDownload(onlineResource: any, downloadOptions: DownloadOptions): void {
        event.stopPropagation();
        const modelRef = this.modalService.open(DownloadOptionsModalContent, { size: 'lg' });
        modelRef.componentInstance.onlineResource = onlineResource;
        modelRef.componentInstance.downloadOptions = downloadOptions;
    }

    /**
     * User has selected to save the selected datasets
     */
    public captureData(): void {
        if(this.selectedDatasetNodes) {
            this.selectedLeafNodeCount = 0;
            let datasetDownloads: DatasetDownloadModel[] = [];
            for(let record of this.selectedDatasetNodes) {
                if(record.data.leaf) {
                    if(record.data.cswRecord && record.data.onlineResource && record.data.downloadOptions) {
                        console.log("Persisting record, resource and options");
                        const datasetDownload: DatasetDownloadModel = {
                            cswRecord: record.data.cswRecord,
                            onlineResource: record.data.onlineResource,
                            downloadOptions: record.data.downloadOptions
                        }
                        datasetDownloads.push(datasetDownload);
                        this.selectedLeafNodeCount++;
                        //this.userStateService.addDatasetDownload(datasetDownload);
                    }
                }
            }
            this.userStateService.setDatasetDownloads(datasetDownloads);
            // Display selecition OK modal
            this.modalService.open(this.selectedDatasetsOkModal);
        }
        this.activeModal.close();
    }

}
