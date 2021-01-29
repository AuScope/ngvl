import { Component, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Proj from 'ol/proj';
import { OlMapObject } from 'portal-core-ui';
import { GraceGraphModalComponent } from '../../../../shared/modules/grace/grace-graph.modal.component';


@Component({
    selector: 'app-ol-map-grace-data',
    templateUrl: './olmap.grace-data.component.html',
    styleUrls: ['./olmap.grace-data.component.scss']
})

export class OlMapGraceDataComponent implements AfterViewInit {

    buttonText = "GRACE";


    constructor(public olMapObject: OlMapObject, private modalService: NgbModal) {}


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

}
