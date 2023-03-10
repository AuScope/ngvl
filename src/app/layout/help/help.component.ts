import { Component } from '@angular/core';
import { routerTransition } from '../../router.animations';



@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss'],
    animations: [routerTransition()]
})
export class HelpComponent {

  constructor() {}

  /*
  scrollToElement($element) {
    $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }
  */

}
