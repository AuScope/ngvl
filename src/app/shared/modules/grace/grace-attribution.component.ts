import { Component } from "@angular/core";

import { environment } from '../../../../environments/environment';


@Component({
    selector: 'app-grace-attribution',
    templateUrl: './grace-attribution.component.html',
    styleUrls: ['./grace-attribution.component.scss']
})

export class GraceAttributionComponent {

    attributionText = environment.grace.attributionText;

    constructor() { }


    attributionLinkClicked() {
        //window.open(environment.grace.attributionLink, "_blank");
    }

}
