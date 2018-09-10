import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { RemoteDatasetsModalContent } from './remote-datasets.modal.component';
import { UserStateService } from '../../shared';
import { CSWSearchService } from '../../shared/services/csw-search.service';
import { OnlineResourceModel } from 'portal-core-ui/model/data/onlineresource.model';


@Component({
    selector: 'record-modal-content',
    templateUrl: './record.modal.component.html',
    styleUrls: ['./record.modal.component.scss']
})

export class RecordModalContent implements OnInit {

    @Input() record: any;
    onlineResources: any;


    constructor(private userStateService: UserStateService,
                private cswSearchService: CSWSearchService,
                private modalService: NgbModal,
                public activeModal: NgbActiveModal) { }


    ngOnInit() {
        this.onlineResources = this.cswSearchService.supportedOnlineResources;
    }

    /**
     * Add remote download. Displays dialog, "OK" will create and add a
     * remote download to the data selection service (local storage)
     * 
     * @param cswRecord the associated CSW record
     * @param url the URL for the remote download
     */
    public addDatasetToJob(cswRecord: CSWRecordModel, url: string): void {
        const modalRef = this.modalService.open(RemoteDatasetsModalContent);
        modalRef.componentInstance.remoteUrl = url;
        modalRef.result.then(jobDownload => {
            jobDownload.cswRecord = cswRecord;
            // Create a WWW online resource type for the remote download
            const onlineResource: OnlineResourceModel = {
                url: url,
                type: "WWW",
                name: cswRecord.name,
                description: cswRecord.description,
                version: "",
                applicationProfile: "",
                geographicElements: cswRecord.geographicElements

            }
            jobDownload.onlineResource = onlineResource;
            this.userStateService.addJobDownload(jobDownload);
        }, () => {});
    }

    /*
     * Convenience methods to template to access CSWSearch Service
     */
    public getSupportedOnlineResourceTypes(): string[] {
        return this.cswSearchService.getSupportedOnlineResourceTypes();
    }

    public getOnlineResourcesByType(cswRecord: CSWRecordModel, type: string): OnlineResourceModel[] {
        return this.cswSearchService.getOnlineResourcesByType(cswRecord, type);
    }

}
