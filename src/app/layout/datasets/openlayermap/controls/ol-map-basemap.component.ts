import { Component, Inject, OnInit } from '@angular/core';
import { OlMapService } from 'portal-core-ui';

@Component({
  selector: 'app-ol-map-basemap',
  templateUrl: './ol-map-basemap.component.html',
  styleUrls: ['./ol-map-basemap.component.scss']
})
export class OlMapBasemapComponent implements OnInit {

  baseMapIsCollapsed = true;
  baseMaps: any[] = [];
  selectedBaseMap: any;


  constructor(private olMapService: OlMapService, @Inject('env') private env) {
  }
  
  ngOnInit() {
    if(this.env.baseMapLayers) {
      this.baseMaps = this.env.baseMapLayers;
      this.selectedBaseMap = this.baseMaps[0].value;
    }
  }

  onBaseMapSelection() {
    if(this.selectedBaseMap) {
      this.olMapService.switchBaseMap(this.selectedBaseMap);
      this.baseMapIsCollapsed = true;
    }
  }

}
