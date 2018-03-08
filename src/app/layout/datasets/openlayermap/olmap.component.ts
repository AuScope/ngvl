import { OlMapObject } from 'portal-core-ui/service/openlayermap/ol-map-object';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import olControlZoom from 'ol/control/zoom';


/*
 * Note: The hight style is important or the map won't appear on first load
 */
@Component({
  selector: 'app-ol-map',
  template: `
    <div #mapElement id="map" class="height-full width-full" style="height:calc(100vh - 200px);"></div>
    `
  // The "#" (template reference variable) matters to access the map element with the ViewChild decorator!
})

export class OlMapComponent implements AfterViewInit {
  // This is necessary to access the html element to set the map target (after view init)!
  @ViewChild('mapElement') mapElement: ElementRef;


  constructor(public olMapObject: OlMapObject) { }


  // After view init the map target can be set!
  ngAfterViewInit() {
    this.olMapObject.getMap().setTarget(this.mapElement.nativeElement.id);
    const zoom: olControlZoom = new olControlZoom();
    this.olMapObject.addControlToMap(zoom);
  }

}
