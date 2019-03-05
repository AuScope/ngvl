import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { RemoteDatasetsModalComponent } from './remote-datasets.modal.component';
import { UserStateService } from '../../shared';
import { CSWSearchService } from '../../shared/services/csw-search.service';
import { OnlineResourceModel } from 'portal-core-ui/model/data/onlineresource.model';


@Component({
    selector: 'app-record-modal-content',
    templateUrl: './record.modal.component.html',
    styleUrls: ['./record.modal.component.scss']
})

export class RecordModalComponent implements OnInit {

    @Input() record: any;
    onlineResources: any;

    // Selections saved dialog
    @ViewChild('selectedDatasetsOkModal') public selectedDatasetsOkModal;


    constructor(private router: Router,
                private userStateService: UserStateService,
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
     * @param cswRecord the CSW record
     * @param url the selected online resource for the record
     */
    public addDatasetToJob(cswRecord: CSWRecordModel, onlineResource: OnlineResourceModel): void {
        // Grab last part of URL for name, remove trailing '/' first if there is one
        let url = onlineResource.url;
        if (url.charAt(url.length - 1) === '/') {
            url = url.slice(0, -1);
        }
        let name = url.substring(url.lastIndexOf('/') + 1);
        // Failing last part of URL working as a name, use the record ID
        if (name === '') {
            name = 'Remote_Dataset_' + cswRecord.id;
        }
        let description = cswRecord.name;
        let location = './' + name;
        const modalRef = this.modalService.open(RemoteDatasetsModalComponent);
        modalRef.componentInstance.remoteUrl = onlineResource.url;
        modalRef.componentInstance.remoteName = name;
        modalRef.componentInstance.remoteDescription = description;
        modalRef.componentInstance.remoteLocation = location;
        modalRef.result.then(jobDownload => {
            jobDownload.cswRecord = cswRecord;
            jobDownload.onlineResource = onlineResource;
            this.userStateService.addJobDownload(jobDownload);
            // Show success dialog
            this.modalService.open(this.selectedDatasetsOkModal).result.then((result) => {
                if (result === 'New click') {
                    this.router.navigate(['/wizard']);
                    this.activeModal.close();
                }
            }, () => {});
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
