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

    // Service submenu dropdowns
    ncssExpanded: boolean = true;
    wcsExpanded: boolean = true;
    wmsExpanded: boolean = true;
    wwwExpanded: boolean = true;


    constructor(public activeModal: NgbActiveModal) { }


    /**
     * 
     * @param cswRecord 
     */
    public getNetCDFServices(cswRecord: CSWRecordModel): OnlineResourceModel[] {
        let serviceList: OnlineResourceModel[] = [];
        for (const onlineResource of cswRecord.onlineResources) {
            if (onlineResource.type === Constants.resourceType.NCSS) {
                let res: OnlineResourceModel = onlineResource;
                res.cswRecord = cswRecord;
                serviceList.push(res);
            }
        }
        return serviceList;
    }


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
