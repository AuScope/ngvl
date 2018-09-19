import { Component } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';


@Component({
    selector: 'app-image-preview',
    templateUrl: 'image-preview.component.html',
    styleUrls: ['image-preview.component.scss']
})


export class ImagePreview implements PreviewComponent {

    // Data will be a URL to the server's getImagePreview endpoint
    data: any;

    // Image modal is hidden by default
    showingImageModal: boolean = false;

    atBottom: boolean = false;

    constructor() {
    }


    /**
     * Toggle whether image modal is displayed
     */
    public isShowingImageModal(showModal: boolean): void {
        this.showingImageModal = showModal;
    }


    /**
     * Set the image modal style based on whether image is being previewed
     * full screen or not
     */
    public setModalStyle(): any {
        let styles = {};
        if(this.showingImageModal) {
            styles = {
                'display': 'block'
            }
        } else {
            styles = {
                'display': 'none'
            }
        }
        return styles;
    }

}