import { Component } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';



@Component({
    selector: 'app-plaintext-preview',
    templateUrl: 'plaintext-preview.component.html',
    styleUrls: ['plaintext-preview.component.scss']
})


export class PlainTextPreview implements PreviewComponent {

    data: any;


    constructor() { }

}