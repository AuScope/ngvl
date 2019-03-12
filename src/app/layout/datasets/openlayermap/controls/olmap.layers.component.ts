import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { LayerModel } from 'portal-core-ui/model/data/layer.model';
import { Component } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecordModalComponent } from '../../record.modal.component';


@Component({
    selector: 'app-ol-map-layers',
    templateUrl: './olmap.layers.component.html',
    styleUrls: ['./olmap.layers.component.scss']
})

export class OlMapLayersComponent {

    activeLayersIsCollapsed = true;


    constructor(private olMapService: OlMapService, private modalService: NgbModal) {}


    /**
     * TODO: This is used elsewhere, should make a map service method
     */
    public getActiveLayerCount(): number {
        return Object.keys(this.olMapService.getLayerModelList()).length;
    }


    /**
     * Get active layers
     */
    public getActiveLayers(): LayerModel[] {
        const layers: LayerModel[] = [];
        const keys = Object.keys(this.olMapService.getLayerModelList());
        for (let i = 0; i < keys.length; i++) {
            layers.push(this.olMapService.getLayerModelList()[keys[i]]);
        }
        return layers;
    }


    /**
     *
     * @param layer
     */
    public toggleLayerVisibility(layer: LayerModel): void {
        this.olMapService.setLayerVisibility(layer.id, layer.hidden);
    }


    /**
     *
     * @param layer
     */
    public displayRecordInformation(layer: LayerModel) {
        if (layer.cswRecords.length > 0) {
            const modelRef = this.modalService.open(RecordModalComponent, {size: 'lg'});
            // TODO: DO we ever need to worry about other records?
            modelRef.componentInstance.record = layer.cswRecords[0];
        }
    }


    /**
     *
     * @param recordId
     */
    public removeRecord(recordId: string): void {
        this.olMapService.removeLayer(this.olMapService.getLayerModel(recordId));
    }

}
