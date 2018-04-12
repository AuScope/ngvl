import { Component } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';


@Component({
    selector: 'app-data-service-preview',
    templateUrl: 'data-service-preview.component.html',
    styleUrls: ['data-service-preview.component.scss']
})


export class DataServicePreview implements PreviewComponent {

    data: any;


    constructor() { }

}