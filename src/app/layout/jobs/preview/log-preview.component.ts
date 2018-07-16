import { Component } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';



@Component({
    selector: 'app-log-preview',
    templateUrl: 'log-preview.component.html',
    styleUrls: []
})


/**
 * TODO: Add sectioned log tab view similar to VGL
 */
export class LogPreview implements PreviewComponent {

    // Data will be the plaintext string
    data: any;


    constructor() { }

}