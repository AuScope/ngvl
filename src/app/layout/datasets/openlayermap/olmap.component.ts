import { OlMapObject } from '@auscope/portal-core-ui';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

/*
 * Note: The hight style is important or the map won't appear on first load
 */
@Component({
    selector: 'app-ol-map',
    styleUrls: ['./olmap.component.scss'],
    template: `
    <div #mapElement id="map" class="height-full width-full" style="height:calc(100vh - 132px);"></div>
    `
    // The "#" (template reference variable) matters to access the map element with the ViewChild decorator!
})

export class OlMapComponent implements AfterViewInit {

    // This is necessary to access the html element to set the map target (after view init)!
    @ViewChild('mapElement') mapElement: ElementRef;

    constructor(public olMapObject: OlMapObject) { }

    // After view init the map target can be set!
    ngAfterViewInit() {
        const map = this.olMapObject.getMap();
        map.setTarget(this.mapElement.nativeElement.id);
        map.getView().setCenter([14919489.189196264, -3268587.3956784257]);
        map.getView().setZoom(5);
    }

}
