import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Observable } from 'rxjs/Observable';

import { AuthService, UserStateService } from '../../../shared';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  pushRightClass: string = 'push-right';

  username$: Observable<string>;
  isUserConfigured$: Observable<boolean>;

  constructor(private translate: TranslateService,
              private userStateService: UserStateService,
              private authService: AuthService,
              public router: Router) {

    this.router.events.subscribe(val => {
      if (
        val instanceof NavigationEnd &&
          window.innerWidth <= 992 &&
          this.isToggled()
      ) {
        this.toggleSidebar();
      }
    });

    this.username$ = this.userStateService.user.map(user => user.fullName);
    this.isUserConfigured$ = this.userStateService.getHasConfiguredComputeServices().map(hasConfigured => hasConfigured.success);
  }

    ngOnInit() {}

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

  onLogIn() {
      // Store the current url then login.
      this.authService.redirectUrl = this.router.url;
      this.authService.login();
    }

  onLogOut() {
      this.authService.logout();
    }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

    changeLang(language: string) {
        this.translate.use(language);
    }

    public configureComputeServices(): void {
        this.router.navigate(['/user'], { queryParams: { noconfig: 1 } });
    }

}
