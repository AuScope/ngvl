import olLayer from 'ol/layer/layer';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { LayerModel } from 'portal-core-ui/model/data/layer.model';
import { Component } from '@angular/core';


@Component({
    selector: 'app-ol-map-layers',
    templateUrl: './olmap.layers.component.html',
    styleUrls: ['./olmap.layers.component.scss']
})

export class OlMapLayersComponent {

    activeLayersIsCollapsed = true;


    constructor(private olMapService: OlMapService) {}


    public getActiveLayerCount(): number {
        return Object.keys(this.olMapService.getLayers()).length;
    }

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

    public toggleLayerVisibility(layer: LayerModel): void {
        this.olMapService.setLayerVisibility(layer.id, layer.hidden);
    }

}
