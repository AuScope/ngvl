import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, NgZone } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';


import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
//import OSM from 'ol/source/OSM';
//import ImageLayer from 'ol/layer/Image';
//import ImageStatic from 'ol/source/Image';
import { Constants } from "portal-core-ui";



@Component({
    selector: 'app-geotiff-preview',
    templateUrl: 'geotiff-preview.component.html',
    styleUrls: ['geotiff-preview.component.scss']
})


export class GeoTiffPreviewComponent implements AfterViewInit, OnInit, PreviewComponent {

    // Data will be a URL to the server's getImagePreview endpoint
    data: any;

    // Image modal is hidden by default
    //showingImageModal: boolean = false;
    atBottom: boolean = false;
    //@ViewChild('imageModal') scrollElement: ElementRef;


    //@ViewChild('previewMapElement') previewMapElement: ElementRef;

    previewMap: Map;



    constructor(private zone: NgZone) {
    }

    ngOnInit() {
      this.previewMap = new Map({
        target: 'previewMap',
        controls: [],
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
          })/*,
          new ImageLayer({
                source: new ImageStatic({
                    url: this.data,
                    projection: "EPSG:4326",
                    //imageExtent: extent
                })
          })
          */
        ],
        view: new View({
          center: Constants.CENTRE_COORD,
          zoom: 4
        })
      });
    }

    ngAfterViewInit() {
        /*
        let width, height, extent;

        fetch("data/image.tif").then(function (response) {
            return response.arrayBuffer();
        })
        .then(function (arrayBuffer) {
            return fromArrayBuffer(arrayBuffer);
        })
        .then(function (tiff) {
            return tiff.getImage();
        })
        .then(function (image) {
            width = image.getWidth();
            height = image.getHeight();
            extent = image.getBoundingBox();
            return image.readRGB();
        })
        .then(function (rgb) {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            const data = context.getImageData(0, 0, width, height);
            const rgba = data.data;
            let j = 0;
            for (let i = 0; i < rgb.length; i += 3) {
            rgba[j] = rgb[i];
            rgba[j + 1] = rgb[i + 1];
            rgba[j + 2] = rgb[i + 2];
            rgba[j + 3] = 255;
            j += 4;
            }
            context.putImageData(data, 0, 0);

            this.previewMap.addLayer(
                new ImageLayer({
                    source: new Static({
                    url: canvas.toDataURL(),
                    projection: "EPSG:27700",
                    imageExtent: extent
                    })
                })
            );
        });
        */
    }


    /**
     * Toggle whether image modal is displayed
     */
    /*
    public isShowingImageModal(showModal: boolean): void {
        this.showingImageModal = showModal;
    }
    */


    /**
     * Set the image modal style based on whether image is being previewed
     * full screen or not
     */
    /*
    public setModalStyle(): any {
        let styles = {};
        if (this.showingImageModal) {
            styles = {
                'display': 'block'
            };
        } else {
            styles = {
                'display': 'none'
            };
        }
        return styles;
    }
    */

    /*
    onScroll(event) {
        let target = event.target || event.srcElement;
        if ((target.scrollHeight - target.scrollTop) === target.clientHeight) {
            this.atBottom = true;
        } else {
            this.atBottom = false;
        }
    }
    */

}
