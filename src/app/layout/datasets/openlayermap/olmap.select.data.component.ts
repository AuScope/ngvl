import { OlMapService } from './../../../shared/modules/portal-core-ui/service/openlayermap/ol-map.service';
import { Component } from '@angular/core';


@Component({
  selector: 'app-ol-map-select-data',
  template: `
    <button type="button" class="btn btn-sm btn-inverse active" (click)='selectDataClick()'>
      <span class="fa fa-edit" aria-hidden="true"></span> {{buttonText}}</button>
    `
  // The "#" (template reference variable) matters to access the map element with the ViewChild decorator!
})

export class OlMapDataSelectComponent {

  buttonText = 'Select Data';

  constructor(private olMapService: OlMapService) {}

  /**
   * toggle on zoom to zoom into bbox
   */
  public selectDataClick() {
    this.buttonText = 'Click on Map';
    this.olMapService.drawBound().subscribe((vector) => {
        /*
      const features = vector.getSource().getFeatures();
      const me = this;
      // Go through this array and get coordinates of their geometry.
      features.forEach(function(feature) {
        me.buttonText = 'Magnify';
        me.olMapService.fitView(feature.getGeometry().getExtent());
      });
      */

    });
  }
}
