import { OlMapObject } from '../../../shared/modules/portal-core-ui/service/openlayermap/ol-map-object';
import { OlMapService } from '../../../shared/modules/portal-core-ui/service/openlayermap/ol-map.service';
import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-ol-map',
  template: `
    <div #mapElement id="map" class="height-full width-full"> </div>
    `
  // The "#" (template reference variable) matters to access the map element with the ViewChild decorator!
})

export class OlMapComponent implements AfterViewInit {
  // This is necessary to access the html element to set the map target (after view init)!
  @ViewChild('mapElement') mapElement: ElementRef;



  constructor(public olMapObject: OlMapObject, private olMapService: OlMapService) {

  }


  // After view init the map target can be set!
  ngAfterViewInit() {
    this.olMapObject.getMap().setTarget(this.mapElement.nativeElement.id);
  }

}
