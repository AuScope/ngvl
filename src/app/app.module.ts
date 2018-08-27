import { environment } from '../environments/environment';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomReuseStrategy } from './app-custom-reuse-strategy';
import { AuthGuard, AuthService } from './shared';
import { PortalCoreModule } from 'portal-core-ui/portal-core.module';
import { UserStateService } from './shared';
import { VglModule } from './shared';
import { UserModule } from './layout/user/user.module';
import { LandingpageModule } from './landingpage/landingpage.module';

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  // for development
  // return new TranslateHttpLoader(http, '/start-angular/SB-Admin-BS4-Angular-5/master/dist/assets/i18n/', '.json');
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    PortalCoreModule.forRoot(environment),
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),   
    LandingpageModule,
    AppRoutingModule,
    VglModule,
    UserModule
  ],
  declarations: [AppComponent],
  providers: [AuthGuard, AuthService, UserStateService, { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule {}
