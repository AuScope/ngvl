import { Component } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';


@Component({
    selector: 'app-image-preview',
    templateUrl: 'image-preview.component.html',
    styleUrls: ['image-preview.component.scss']
})


export class ImagePreview implements PreviewComponent {

    data: any;


    constructor() { }

}