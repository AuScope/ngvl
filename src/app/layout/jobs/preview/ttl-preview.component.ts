import { Component,ViewChild, ElementRef } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';


@Component({
    selector: 'app-ttl-preview',
    templateUrl: 'ttl-preview.component.html',
    styleUrls: []
})


export class TtlPreview implements PreviewComponent {

    // Data will be the TTL data as a plaintext string
    data: any;

    atBottom: boolean = false;

    @ViewChild('scrollarea') scrollElement: ElementRef;

    constructor() { }

    onScroll(event) {
        var target = event.target || event.srcElement;
        if ((target.scrollTop + target.clientHeight) > target.scrollHeight - 100) {
            this.atBottom = true;
        }
        else
            this.atBottom = false;
    }
    
}