import { Component, HostListener, ViewChild, ElementRef } from "@angular/core";
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

    @ViewChild('imageModal') scrollElement: ElementRef;

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

    @HostListener('wheel', ['$event'])
    onWheel($event): void {
        if (($event.srcElement.scrollTop + $event.srcElement.clientHeight) > $event.srcElement.scrollHeight - 100) {
            this.atBottom = true;
        }
        else
            this.atBottom = false;
    };

    onScroll(event) {
        if ((event.srcElement.scrollTop + event.srcElement.clientHeight) > event.srcElement.scrollHeight - 100) {
            this.atBottom = true;
        }
        else
            this.atBottom = false;
    }
}