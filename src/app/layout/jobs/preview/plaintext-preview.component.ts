import { Component } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';



@Component({
    selector: 'app-plaintext-preview',
    templateUrl: 'plaintext-preview.component.html',
    styleUrls: []
})


export class PlainTextPreview implements PreviewComponent {

    // Data will be the plaintext string
    data: any;


    constructor() { }

}