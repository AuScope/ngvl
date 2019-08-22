import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { LayerModel } from 'portal-core-ui/model/data/layer.model';
import { Component } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecordModalComponent } from '../../record.modal.component';

import Proj from 'ol/proj';


@Component({
    selector: 'app-ol-map-layers',
    templateUrl: './olmap.layers.component.html',
    styleUrls: ['./olmap.layers.component.scss']
})

export class OlMapLayersComponent {

    activeLayersIsCollapsed = true;

    // Store opacities so they can be re-set if anonymous user logs in
    layerOpacities: Map<String, number> = new Map<String, number>();


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
            let currentLayer = this.olMapService.getLayerModelList()[keys[i]];
            layers.push(currentLayer);
            this.layerOpacities.set(currentLayer.id, 100);
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
     * @param layer
     */
    public showCSWRecordBounds(layer: any): void {
        if (layer.cswRecords) {
            for(let record of layer.cswRecords) {
                if(record.geographicElements && record.geographicElements.length > 0) {
                    let bounds = record.geographicElements.find(i => i.type === 'bbox');
                    if(bounds) {
                        const bbox: [number, number, number, number] =
                            [bounds.westBoundLongitude, bounds.southBoundLatitude, bounds.eastBoundLongitude, bounds.northBoundLatitude];
                        const extent = Proj.transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
                        this.olMapService.displayExtent(extent, 3000);
                        return;
                    }
                }
            }
        }
    }

    /**
     *
     * @param layer
     */
    public zoomToCSWRecordBounds(layer: any): void {
        if (layer.cswRecords) {
            for(let record of layer.cswRecords) {
                if(record.geographicElements && record.geographicElements.length > 0) {
                    let bounds = record.geographicElements.find(i => i.type === 'bbox');
                    const bbox: [number, number, number, number] =
                        [bounds.westBoundLongitude, bounds.southBoundLatitude, bounds.eastBoundLongitude, bounds.northBoundLatitude];
                    const extent = Proj.transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
                    this.olMapService.fitView(extent);
                    return;
                }
            }
        }
    }

    /**
     * 
     * @param layerId 
     * @param opacity 
     */
    public setLayerOpacity(layerId: string, e: any) {
        this.layerOpacities.set(layerId, e.value);
        this.olMapService.setLayerOpacity(layerId, e.value/100);
    }

    /**
     *
     * @param recordId
     */
    public removeRecord(recordId: string): void {
        this.olMapService.removeLayer(this.olMapService.getLayerModel(recordId));
    }

}
