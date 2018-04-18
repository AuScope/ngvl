import { Component } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';


@Component({
    selector: 'app-image-preview',
    templateUrl: 'image-preview.component.html',
    styleUrls: []
})


export class ImagePreview implements PreviewComponent {

    // Data will be a URL to the server's getImagePreview endpoint
    data: any;


    constructor() { }

}