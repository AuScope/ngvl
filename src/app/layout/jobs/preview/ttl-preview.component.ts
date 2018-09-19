import { Component } from "@angular/core";
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

    constructor() { }

}