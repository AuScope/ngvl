import { Component, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OlMapObject } from 'portal-core-ui/service/openlayermap/ol-map-object';
import { environment } from '../../../../../environments/environment';
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
            const modalRef = this.modalService.open(GraceGraphModalComponent, { size: 'lg' });
            modalRef.componentInstance.parameter = "estimate";
            modalRef.componentInstance.x = clickCoord[0];
            modalRef.componentInstance.y = clickCoord[1];
            this.buttonText = 'GRACE';
        }
    }

    public isGraceHostSet(): boolean {
        if (!environment['graceHost'] || environment['graceHost'] === '') {
            return false;
        }
        return true;
    }

    public isActiveGraceLayerPresent(): boolean {
        // TODO: Actually check if there's an active GRACE layer
        return true;
    }

}
