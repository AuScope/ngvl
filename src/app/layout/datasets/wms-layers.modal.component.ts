import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';


@Component({
    selector: 'app-wms-layers',
    templateUrl: './wms-layers.modal.component.html',
    styleUrls: ['./wms-layers.modal.component.scss']
})
export class WmsLayersModalComponent implements OnInit {

    wmsUrl: string;
    layersLoading: boolean = false;
    layerRecords: CSWRecordModel[];
    selectedLayers: Map<string, CSWRecordModel>;
    errorMessage: string;

    constructor(public activeModal: NgbActiveModal, private vgl: VglService) { }

    ngOnInit() {
        this.layersLoading = true;
        this.selectedLayers = new Map<string, CSWRecordModel>();
        this.errorMessage = null;
        this.vgl.getCustomLayerRecords(this.wmsUrl).subscribe(response => {
            this.layersLoading = false;
            this.layerRecords = response;
        }, error => {
            this.layersLoading = false;
            this.errorMessage = "Unable to retrieve layers. Please check the WMS URL above."
        });
    }

    layerChangeEvent(event: any, layer: CSWRecordModel) {
        if (event.currentTarget.checked) {
            this.selectedLayers.set(layer.id, layer);
        } else {
            this.selectedLayers.delete(layer.id);
        }
    }

    addLayers() {
        let cswRecords: CSWRecordModel[] = [];
        this.selectedLayers.forEach((value: CSWRecordModel, key: string) => {
            cswRecords.push(value);
        });
        this.activeModal.close(cswRecords);
    }

    /*
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
    */

}
