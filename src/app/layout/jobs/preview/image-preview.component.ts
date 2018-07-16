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

    // Is fit to preview checkbox selected, currently unused
    fitImageToPreview: boolean = false;


    constructor() {
    }


    /**
     * Currently unused, can be used to apply style change to img element
     */
    public setStyles(): any {
        let styles = {};
        if(this.fitImageToPreview) {
            styles = {
                'width': '100%',
                'height': '100%'
            }
        } else {
            styles = {
                'overflow': 'hidden'
            }
        }
        return styles;
    }

    /**
     * 
     * @param cbElement The "fit to preview" checkbox
     */
    public fitPreviewCheckboxChanged(cbElement: HTMLInputElement): void {
        this.fitImageToPreview = cbElement.checked;
    }


}