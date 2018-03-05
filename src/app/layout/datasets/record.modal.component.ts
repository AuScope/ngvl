import { Component, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'portal-core-ui/utility/constants.service';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { OnlineResourceModel } from 'portal-core-ui/model/data/onlineresource.model';


@Component({
    selector: 'record-modal-content',
    templateUrl: './record.modal.component.html'
})

export class RecordModalContent {

    @Input() record: any;

    // Types of online resources
    onlineResources: any = {
        'NCSS': {
            'name': 'NetCDF Subset Services',
            'expanded': true
        },
        'WCS': {
            'name': 'OGC Web Coverage Service 1.0.0',
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


    constructor(public activeModal: NgbActiveModal) { }


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
                //res.cswRecord = cswRecord;
                serviceList.push(res);
            }
        }
        return serviceList;
    }

}
