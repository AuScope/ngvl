import { Component,HostListener,ViewChild, ElementRef } from "@angular/core";
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