import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { Component } from '@angular/core';


@Component({
  selector: 'app-ol-map-select-data',
  templateUrl: './olmap.select.data.component.html',
  styleUrls: ['./olmap.select.data.component.scss']
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
        this.buttonText = 'Select Data';

    });
  }

  /**
   * TODO: This is used elsewhere, should make a map service method
   */
  public getActiveLayerCount(): number {
    return Object.keys(this.olMapService.getLayers()).length;
  }
}
