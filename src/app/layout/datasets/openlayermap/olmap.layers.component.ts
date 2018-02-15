import olLayer from 'ol/layer/layer';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { LayerModel } from 'portal-core-ui/model/data/layer.model';
import { Component } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecordModalContent } from '../record.modal.component';


@Component({
    selector: 'app-ol-map-layers',
    templateUrl: './olmap.layers.component.html',
    styleUrls: ['./olmap.layers.component.scss']
})

export class OlMapLayersComponent {

    activeLayersIsCollapsed = true;


    constructor(private olMapService: OlMapService, private modalService: NgbModal) {}


    /**
     * 
     */
    public getActiveLayerCount(): number {
        return Object.keys(this.olMapService.getLayers()).length;
    }


    /**
     * 
     */
    public getActiveLayers(): LayerModel[] {
        let layers: LayerModel[] = [];
        const activeLayers: { [id: string]: [olLayer] } = this.olMapService.getLayers();
        for(const layerId in activeLayers) {
            const layerTiles = activeLayers[layerId];
            layerTiles.forEach(layer => {
                layers.push(layer.layer);
            });
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
     */
    public displayRecord(layer: LayerModel) {
        if(layer.cswRecords.length > 0) {
            const modelRef = this.modalService.open(RecordModalContent);
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
