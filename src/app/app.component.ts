import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private translate: TranslateService, private authService: AuthService) {
      
    // Set up translation service (moved from header.component as login.component wasn't being translated)
    this.translate.addLangs(['en', 'fr', 'ur', 'es', 'it', 'fa', 'de']);
    this.translate.setDefaultLang('en');
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang.match(/en|fr|ur|es|it|fa|de/) ? browserLang : 'en');

    // Check server to see if user is still logged in
    authService.checkServerLogin();
  }

  ngOnInit() {
  }

}
