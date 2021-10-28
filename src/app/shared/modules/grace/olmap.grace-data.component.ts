import { Component, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Proj from 'ol/proj';
import { OlMapObject } from 'portal-core-ui';
import { GraceGraphModalComponent } from './grace-graph.modal.component';
import { GraceGraphModalComponent2 } from './grace-graph.modal.component2';

import olDraw from 'ol/interaction/Draw';
import olSourceVector from 'ol/source/Vector';
import olLayerVector from 'ol/layer/Vector';
import { BasinChooserModalComponent } from './basin-chooser.modal.component';


enum SELECTION_MODE {
    none, point, poly
}


@Component({
    selector: 'app-ol-map-grace-data',
    templateUrl: './olmap.grace-data.component.html',
    styleUrls: ['./olmap.grace-data.component.scss']
})

export class OlMapGraceDataComponent implements AfterViewInit {

    buttonText = "GRACE";

    // TODO: Don't need for poly, can just be boolean
    selectionMode = SELECTION_MODE.none;


    constructor(public olMapObject: OlMapObject, private modalService: NgbModal) {}


    ngAfterViewInit() {
        // register click handler
        this.olMapObject.registerClickHandler(this.handleClick.bind(this));
    }

    public selectGraceDataPoint() {
        this.selectionMode = SELECTION_MODE.point;
        this.buttonText = 'Click on Mascon';
        this.olMapObject.getMap().getTargetElement().style.cursor = "crosshair";
    }

    public selectGraceDataPolygon() {
        //this.selectionMode = SELECTION_MODE.poly; // No point?
        this.buttonText = 'Click to draw polygon (double-click to end)';
        const source = new olSourceVector({ wrapX: false });
        const vector = new olLayerVector({
            source: source
        });
        this.olMapObject.getMap().addLayer(vector);
        const draw = new olDraw({
            source: source,
            type: ('Polygon')
        });
        const me = this;
        draw.on('drawend', function (e) {
            const coords = e.feature.getGeometry().getCoordinates()[0];
            const coordString = coords.join(' ');
            vector.set('polygonString', coordString);
            me.olMapObject.getMap().removeInteraction(draw);
            for (let i = 0; i < coords.length; i++) {
                coords[i] = Proj.transform(coords[i], 'EPSG:3857', 'EPSG:4326');
            }
            const modalRef = me.modalService.open(GraceGraphModalComponent2, { size: 'lg' });
            modalRef.componentInstance.coords = coords;
            me.buttonText = 'GRACE';
            me.olMapObject.getMap().getTargetElement().style.cursor = "default";
            me.olMapObject.removeVector(vector);
       });
       this.olMapObject.getMap().addInteraction(draw);
    }


    public selectDrainageBasin() {
        const modalRef = this.modalService.open(BasinChooserModalComponent, { size: 'sm' });
    }


    public handleClick(p: [number, number]) {
        if (this.selectionMode === SELECTION_MODE.point) {
            const map = this.olMapObject.getMap();
            const clickCoord = map.getCoordinateFromPixel(p);
            const lonlat = Proj.transform(clickCoord, 'EPSG:3857', 'EPSG:4326');
            const modalRef = this.modalService.open(GraceGraphModalComponent2, { size: 'lg' });
            modalRef.componentInstance.x = lonlat[0];
            modalRef.componentInstance.y = lonlat[1];
            this.buttonText = 'GRACE';
            this.olMapObject.getMap().getTargetElement().style.cursor = "default";
            this.selectionMode = SELECTION_MODE.none;
        }
    }

}
