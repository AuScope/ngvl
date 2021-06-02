import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

declare var Cesium: any;
Cesium.buildModuleUrl.setBaseUrl('/assets/cesium/'); // If you're using Cesium version >= 1.42.0 add this line
window['CESIUM_BASE_URL'] = ''; // For some reason this is required to use Cesium's own typescript definitions

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.log(err));
