import { Component } from '@angular/core';


@Component({
    selector: 'app-ol-keyword1',
    templateUrl: './ol-map.keyword1.component.html',
    styleUrls: ['./ol-map.keyword1.component.scss']
})

export class OlMapKeyword1Component {

    constructor() {}

    public testClick() {
        console.log("CLICK 1");
    }
}
