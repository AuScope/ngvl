import { Component, ViewChild, ElementRef } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';


@Component({
    selector: 'app-ttl-preview',
    templateUrl: 'ttl-preview.component.html',
    styleUrls: []
})


export class TtlPreviewComponent implements PreviewComponent {

    // Data will be the TTL data as a plaintext string
    data: any;

    atBottom: boolean = false;

    @ViewChild('scrollarea') scrollElement: ElementRef;

    constructor() { }

    onScroll(event) {
        let target = event.target || event.srcElement;
        if ((target.scrollHeight - target.scrollTop) === target.clientHeight) {
            this.atBottom = true;
        } else {
            this.atBottom = false;
        }
    }

}
