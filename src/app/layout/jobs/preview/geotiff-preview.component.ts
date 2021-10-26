import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, NgZone } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';

import GeoTIFF, { fromUrl, fromUrls, fromArrayBuffer, fromBlob } from 'geotiff';
import { environment } from '../../../../environments/environment';

import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';

import { getCenter } from 'ol/extent';

import WebGLTileLayer from 'ol/layer/WebGLTile';   // GeoTIFF
import TileLayer from 'ol/layer/Tile';

import Static from 'ol/source/ImageStatic';
import XYZ from 'ol/source/XYZ';
//import OSM from 'ol/source/OSM';

//import { GeoTIFF as olGeoTIFF } from 'ol/source/GeoTIFF';
import { GeoTIFF as olGeoTIFF } from 'ol/source';


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


    constructor(/*private zone: NgZone*/) {
    }

    ngOnInit() {
        const mapSource = new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        });

        this.previewMap = new Map({
            target: 'previewMap',
            controls: [],
            layers: [
                // Baselayer
                new TileLayer({
                    //preload: Infinity,
                    source: mapSource
                })
            ],
            view: new View({
                //projection: "EPSG:4326",
                center: Constants.CENTRE_COORD,
                zoom: 4
            })
        });
        console.log("Base proj: " + mapSource.getProjection().getCode());
    }

    ngAfterViewInit() {
        this.loadImage();
    }

    loadFile(dataUrl: string) {
        const source = new olGeoTIFF({
            sources: [{
                url: dataUrl
            }]
        });
        const layer = new WebGLTileLayer({
            source: source
        });
        this.previewMap.addLayer(layer);
        this.previewMap.setView(source.getView());
    }

    async loadImage() {
        const url = this.data;

        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const tiff = await fromArrayBuffer(arrayBuffer);

        const image = await tiff.getImage(); // by default, the first image is read.
        const width = image.getWidth();
        const height = image.getHeight();
        const bbox = image.getBoundingBox();
        /*
        const tileWidth = image.getTileWidth();
        const tileHeight = image.getTileHeight();
        const samplesPerPixel = image.getSamplesPerPixel();
        const epsgCode = image.geoKeys.ProjectedCSTypeGeoKey || image.geoKeys.GeographicTypeGeoKey;

        console.log("Width: " + width + ", Height: " + height);
        console.log("w * h = " + (width * height) + " (* 3 = " + (width * height * 3) + ")");
        console.log("Tile Width: " + tileWidth + ", Tile Height: " + tileHeight);
        console.log("Samples per pixel: " + samplesPerPixel);
        const origin = image.getOrigin();
        const resolution = image.getResolution();
        console.log("Origin: " + origin);
        console.log("Resolution: " + resolution);
        console.log("bbox: " + bbox);
        console.log("Image EPSG: " + epsgCode);
        */

        const rgb = await image.readRasters({ interleave: true });

        //console.log("Length: " + rgb.length);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        const data = context.getImageData(0, 0, width, height);
        const rgba = data.data;
        let j = 0;
        if (rgb.length === (width * height * 3)) {
            for (let i = 0; i < rgb.length; i += 3) {
                rgba[j] = rgb[i];
                rgba[j + 1] = rgb[i + 1];
                rgba[j + 2] = rgb[i + 2];
                rgba[j + 3] = 255;
                j += 4;
            }
        } else if (rgb.length === (width * height)) {
            for (let i = 0; i < rgb.length; i ++) {
                rgba[j] = rgb[i];
                rgba[j + 1] = rgb[i];
                rgba[j + 2] = rgb[i];
                rgba[j + 3] = 255;
                j += 4;
            }
        } else {
            console.log("Error with TIFF size");
        }
        context.putImageData(data, 0, 0);

        const source = new Static({
            url: canvas.toDataURL(),
            projection: "EPSG:4326",    // default is view projection, can also get from code above
            imageExtent: bbox
        });
        console.log("Adding layer");
        const layer = new ImageLayer({
            source: source
        });

        this.previewMap.addLayer(layer);
    }

}
