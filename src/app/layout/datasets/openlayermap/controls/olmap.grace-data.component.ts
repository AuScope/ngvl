import { Component, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Proj from 'ol/proj';
import { OlMapObject, OlMapService } from 'portal-core-ui';
import { environment } from '../../../../../environments/environment';
import { GraceGraphModalComponent } from '../../../../shared/modules/grace/grace-graph.modal.component';
import { GraceService } from '../../../../shared/modules/grace/grace.service';


@Component({
    selector: 'app-ol-map-grace-data',
    templateUrl: './olmap.grace-data.component.html',
    styleUrls: ['./olmap.grace-data.component.scss']
})

export class OlMapGraceDataComponent implements AfterViewInit {

    buttonText = "GRACE";


    constructor(public olMapObject: OlMapObject, private olMapService: OlMapService,
        private graceService: GraceService, private modalService: NgbModal) {}


    ngAfterViewInit() {
        // register click handler
        this.olMapObject.registerClickHandler(this.handleClick.bind(this));
    }

    public selectGraceData() {
        this.buttonText = 'Click on Mascon';
    }

    public handleClick(p: [number, number]) {
        if (this.buttonText === 'Click on Mascon') {
            const map = this.olMapObject.getMap();
            const clickCoord = map.getCoordinateFromPixel(p);
            const lonlat = Proj.transform(clickCoord, 'EPSG:3857', 'EPSG:4326');
            const modalRef = this.modalService.open(GraceGraphModalComponent, { size: 'lg' });
            modalRef.componentInstance.x = lonlat[0];
            modalRef.componentInstance.y = lonlat[1];
            this.buttonText = 'GRACE';
        }
    }

    public getActiveGraceLayer(): string {
        let graceLayer;
        if (environment.grace && environment.grace.layers && environment.grace.layers.length > 0) {
            for (let layer of environment.grace.layers) {
                if (this.olMapService.layerExists(layer)) {
                    graceLayer = layer;
                    break;
                }
            }
        }
        return graceLayer;
    }

}
