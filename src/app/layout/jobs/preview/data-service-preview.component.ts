import { Component, ViewChild, AfterViewInit } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';
import { OlMapPreviewComponent } from "../../datasets/openlayermap/olmap.preview.component";


@Component({
    selector: 'app-data-service-preview',
    templateUrl: 'data-service-preview.component.html',
    styleUrls: []
})


export class DataServicePreview implements PreviewComponent, AfterViewInit {

    // Data will be the map center point and the bbox geometries
    data: any;

    // Have a reference to the OlMapPreview Component so we can set the data
    @ViewChild(OlMapPreviewComponent) olMapPreview: OlMapPreviewComponent;


    constructor() {
    }


    ngAfterViewInit() {
        this.updateBbox();
    }


    public updateBbox(): void {
        if(this.data != null && this.data.length==2) {
            this.olMapPreview.setupBBoxes(this.data[0], this.data[1]);
        }
    };

}