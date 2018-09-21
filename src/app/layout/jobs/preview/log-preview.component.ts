import { Component, ViewChild, ElementRef } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';
import { DOCUMENT } from "@angular/platform-browser";



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

    atBottom: boolean = false;

    @ViewChild('scrollarea') scrollElement: ElementRef;

    constructor() { }

    onScroll(event) {
        var target = event.target || event.srcElement;
        if ((target.scrollHeight - target.scrollTop) === target.clientHeight) {
            this.atBottom = true;
        }
        else
            this.atBottom = false;
    }    

}