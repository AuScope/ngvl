import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';

import { UserStateService } from '../shared';
import { OlMapService } from 'portal-core-ui/service/openlayermap/ol-map.service';
import { LayerModel } from 'portal-core-ui/model/data/layer.model';

import { environment } from '../../environments/environment';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
  constructor(public olMapService: OlMapService, private userStateService: UserStateService) {}

  ngOnInit() {}

  /**
   * Persist selected layers and job downloads to local storage as we lose all
   * information within services due to the log in site redirect
   */
  private selectedItemsToLocalStorage() {
    let layers: LayerModel[] = Object.values(this.olMapService.getLayerModelList());
    // Map layers
    localStorage.setItem("layers", JSON.stringify(layers));
    // Selected downloads
    localStorage.setItem("jobDownloads", JSON.stringify(this.userStateService.getJobDownloads()));
  }

  loginGoogle() {
    this.selectedItemsToLocalStorage();
    window.location.href = environment.portalBaseUrl + "oauth2/authorization/google";
  }

  loginAaf() {
    this.selectedItemsToLocalStorage();
    window.location.href = "/VGL-Portal/login/aaf";
  }

}
