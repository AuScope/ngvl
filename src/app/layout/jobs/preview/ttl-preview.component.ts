import { Component } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';


@Component({
    selector: 'app-image-preview',
    templateUrl: 'ttl-preview.component.html',
    styleUrls: ['ttl-preview.component.scss']
})


export class TtlPreview implements PreviewComponent {

    data: any;


    constructor() { }

}