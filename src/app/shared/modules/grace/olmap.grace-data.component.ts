import { Component, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Proj from 'ol/proj';

import * as Extent from 'ol/extent';

import Draw from 'ol/interaction/Draw';
import SourceVector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { OlMapObject, OlMapService } from 'portal-core-ui';
import { GraceGraphModalComponent2 } from './grace-graph.modal.component2';
import { CreateAnimationModalComponent } from './create-animation.modal.component';



enum SELECTION_MODE {
    none, point, poly
}


@Component({
    selector: 'app-ol-map-grace-data',
    templateUrl: './olmap.grace-data.component.html',
    styleUrls: ['./olmap.grace-data.component.scss']
})

export class OlMapGraceDataComponent implements AfterViewInit {

    buttonText = "Time Series";

    // TODO: Don't need for poly, can just be boolean
    selectionMode = SELECTION_MODE.none;
    currentRegion: VectorLayer<any> = undefined;

    // Keep track of Draw so we can cancel if user changes to point selection
    draw: Draw;


    constructor(public olMapObject: OlMapObject, private modalService: NgbModal, private olMapService: OlMapService) { }


    ngAfterViewInit() {
        // register click handler
        this.olMapObject.registerClickHandler(this.handleClick.bind(this));
    }

    public selectGraceDataPoint() {
        if (this.selectionMode == SELECTION_MODE.poly) {
            this.draw.abortDrawing();
            this.olMapObject.getMap().removeInteraction(this.draw);
        }
        this.selectionMode = SELECTION_MODE.point;
        this.buttonText = 'Click on Mascon';
        this.olMapObject.getMap().getTargetElement().style.cursor = "crosshair";
    }

    public selectGraceDataPolygon() {
        this.selectionMode = SELECTION_MODE.poly;
        this.buttonText = 'Click to draw polygon (double-click to end)';
        this.olMapObject.getMap().getTargetElement().style.cursor = "crosshair";
        let source = new SourceVector({ wrapX: false });
        this.currentRegion = new VectorLayer({
            source: source
        });
        this.olMapObject.getMap().addLayer(this.currentRegion);

        this.draw = new Draw({
            source: source,
            type: ('Polygon')
        });
        const me = this;
        this.draw.on('drawend', (e) => {
            if (me.selectionMode === SELECTION_MODE.poly) {

                const centroid = Proj.transform(Extent.getCenter(e.feature.getGeometry().getExtent()), 'EPSG:3857', 'EPSG:4326');

                const coords = e.feature.getGeometry().getCoordinates()[0];
                const coordString = coords.join(' ');
                me.currentRegion.set('polygonString', coordString);
                me.olMapObject.getMap().removeInteraction(me.draw);    // Remove if allow user to draw while dialog open
                for (let i = 0; i < coords.length; i++) {
                    coords[i] = Proj.transform(coords[i], 'EPSG:3857', 'EPSG:4326');
                }
                const modalRef = me.modalService.open(GraceGraphModalComponent2, { size: 'lg' });
                modalRef.componentInstance.coords = coords;
                modalRef.componentInstance.centroid = centroid;
                modalRef.result.then((data) => {
                    me.olMapObject.removeVector(me.currentRegion);
                    // Call again after dialog closed, requested by client
                    me.selectGraceDataPolygon();
                }, (reason) => {
                    me.olMapObject.removeVector(me.currentRegion);
                    // Call again after dialog closed, requested by client
                    me.selectGraceDataPolygon();
                });
                me.buttonText = 'Click to draw polygon (double-click to end)';
            }
       });
       this.olMapObject.getMap().addInteraction(this.draw);
    }

    /**
     * TODO: Check there's more than 1 time period or don't bother... or download image?
     */
     public createAnimation() {
        this.olMapService.drawBound().subscribe((vector: VectorLayer<any>) => {
            let extent = vector.getSource().getExtent();
            extent = Proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
            const modalRef = this.modalService.open(CreateAnimationModalComponent, { size: 'md' });
            modalRef.componentInstance.westbound = extent[0];
            modalRef.componentInstance.southBound = extent[1];
            modalRef.componentInstance.eastBound = extent[2];
            modalRef.componentInstance.northBound = extent[3];
        });
    }

    public handleClick(p: [number, number]) {
        if (this.selectionMode === SELECTION_MODE.point) {
            const map = this.olMapObject.getMap();
            const clickCoord = map.getCoordinateFromPixel(p);
            const lonlat = Proj.transform(clickCoord, 'EPSG:3857', 'EPSG:4326');
            const modalRef = this.modalService.open(GraceGraphModalComponent2, { size: 'lg' });
            modalRef.componentInstance.x = lonlat[0];
            modalRef.componentInstance.y = lonlat[1];
        }
    }

}
