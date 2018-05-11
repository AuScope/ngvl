import { Component, Input } from '@angular/core';
import { DownloadOptions } from '../../shared/modules/vgl/models';
import { DownloadOptionsModalContent } from './download-options.modal.component';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { OnlineResourceModel } from 'portal-core-ui/model/data/onlineresource.model';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TreeNode } from 'primeng/api';
import { TreeTable } from 'primeng/treetable';



@Component({
    selector: 'confirm-datasets-modal-content',
    templateUrl: './confirm-datasets.modal.component.html',
    styleUrls: ['./confirm-datasets.modal.component.scss']
})

export class ConfirmDatasetsModalContent {

    @Input() public cswRecordTreeData: TreeNode[] = [];
    selectedData: TreeNode[];


    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) { }


    private makeDownloadUrl(onlineResource: any, dlOptions: DownloadOptions): string {
        let url = "";
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
                /*
                Ext.Ajax.request({
                    url : 'makeErddapUrl.do',
                    params : Ext.apply({saveSession : saveInSession}, dlOptions),
                    callback : Ext.bind(ajaxResponseHandler, this, [callback], true)
                });
                */
            break;
            case 'WFS':
                /*
                Ext.Ajax.request({
                    url : 'makeWfsUrl.do',
                    params : Ext.apply({saveSession : saveInSession}, dlOptions),
                    callback : Ext.bind(ajaxResponseHandler, this, [callback], true)
                });
                */
            break;
            case 'NCSS':
                /*
                Ext.Ajax.request({
                    url : 'makeNetcdfsubseserviceUrl.do',
                    params : Ext.apply({saveSession : saveInSession}, dlOptions),
                    callback : Ext.bind(ajaxResponseHandler, this, [callback], true)
                });
                */
            break;
            default:
                /*
                Ext.Ajax.request({
                    url : 'makeDownloadUrl.do',
                    params : Ext.apply({saveSession : saveInSession}, dlOptions),
                    callback : Ext.bind(ajaxResponseHandler, this, [callback], true)
                });
                */
            break;
        }
        return url;
    }

    /**
     * Download the resource
     * 
     * TODO: Do
     */
    public downloadResource(event): void {
        event.stopPropagation();
        // TODO: Do
        console.log("download...");
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
        if(this.selectedData) {
            for(let record of this.selectedData) {
                if(record.data.leaf) {
                    let cswRecord: CSWRecordModel = record.data.cswRecord;
                    if(cswRecord) {
                        
                    }
                }
            }
        }
        this.activeModal.close();
    }

}
