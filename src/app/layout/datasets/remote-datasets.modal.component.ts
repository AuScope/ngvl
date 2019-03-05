import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JobDownload } from '../../shared/modules/vgl/models';

@Component({
    selector: 'app-remote-datasets',
    templateUrl: './remote-datasets.modal.component.html',
    styleUrls: ['./remote-datasets.modal.component.scss']
})
export class RemoteDatasetsModalComponent {

    // Mandatory fields for remote dataset (will become JobDownload)
    remoteName: string = "";
    remoteDescription: string = "";
    remoteUrl: string = "";
    remoteLocation: string = "";

    constructor(public activeModal: NgbActiveModal) { }

    createRemoteDownload(): void {
        const jobDownload: JobDownload = {
            name: this.remoteName,
            description: this.remoteDescription,
            url: this.remoteUrl,
            localPath: this.remoteLocation,
            northBoundLatitude: -1,
            southBoundLatitude: -1,
            eastBoundLongitude: -1,
            westBoundLongitude: -1,
            owner: '',
            parentUrl: '',
            parentName: '',
            parent: undefined          // No Job associated with this download at this stage
        };
        this.activeModal.close(jobDownload);
    }

}
