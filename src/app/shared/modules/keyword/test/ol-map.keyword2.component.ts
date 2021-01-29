import { Component } from '@angular/core';


@Component({
    selector: 'app-ol-keyword2',
    templateUrl: './ol-map.keyword2.component.html',
    styleUrls: ['./ol-map.keyword2.component.scss']
})

export class OlMapKeyword2Component {

    constructor() {}

    public testClick() {
        console.log("CLICK 2");
    }
}
