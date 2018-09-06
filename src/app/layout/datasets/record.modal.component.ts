import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { OnlineResourceModel } from 'portal-core-ui/model/data/onlineresource.model';
import { RemoteDatasetsModalContent } from './remote-datasets.modal.component';
import { UserStateService } from '../../shared';


@Component({
    selector: 'record-modal-content',
    templateUrl: './record.modal.component.html',
    styleUrls: ['./record.modal.component.scss']
})

export class RecordModalContent {

    @Input() record: any;

    // Types of online resources
    onlineResources: any = {
        'NCSS': {
            'name': 'NetCDF Subset Service',
            'expanded': true
        },
        'WCS': {
            'name': 'OGC Web Coverage Service 1.0.0',
            'expanded': true
        },
        'WFS': {
            'nme': 'OGC Web Feature Service 1.1.0',
            'expanded': true
        },
        'WMS': {
            'name': 'OGC Web Map Service 1.1.1',
            'expanded': true
        },
        'WWW': {
            'name': 'Web Link',
            'expanded': true
        }
    };


    constructor(private userStateService: UserStateService, private modalService: NgbModal,
                public activeModal: NgbActiveModal) { }


    /**
     * Get a list of online resource types for iteration
     */
    getOnlineResourceTypes(): string[] {
        return Object.keys(this.onlineResources);
    }


    /**
     * Get all online resources of a particular resource type for a given
     * CSW record
     * 
     * @param cswRecord the CSW Record
     * @param resourceType  the resource type
     */
    public getOnlineResources(cswRecord: CSWRecordModel, resourceType: string): OnlineResourceModel[] {
        let serviceList: OnlineResourceModel[] = [];
        for (const onlineResource of cswRecord.onlineResources) {
            if (onlineResource.type === resourceType) {
                let res: OnlineResourceModel = onlineResource;
                serviceList.push(res);
            }
        }
        return serviceList;
    }


    /**
     * Add remote download. Displays dialog, "OK" will create and add a
     * remote download to the data selection service (local storage)
     * 
     * @param content the add remote download modal, defined in HTML
     */
    public addDatasetToJob(cswRecord: CSWRecordModel, url: string): void {
        const modalRef = this.modalService.open(RemoteDatasetsModalContent);
        modalRef.componentInstance.remoteUrl = url;
        modalRef.result.then(jobDownload => {
            jobDownload.cswRecord = cswRecord;
            this.userStateService.addJobDownload(jobDownload);
        }, () => {});
    }

}
