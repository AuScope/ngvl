import { Component } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';



@Component({
    selector: 'app-log-preview',
    templateUrl: 'log-preview.component.html',
    styleUrls: ['log-preview.component.scss']
})


/**
 * TODO: Add sectioned log tab view similar to VGL
 */
export class LogPreview implements PreviewComponent {

    // Data will be the plaintext string
    data: any;

    // Expose log keys to template
    logKeys = Object.keys;


    constructor() { }

}