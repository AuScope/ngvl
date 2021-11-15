import { Component, OnInit, AfterViewInit } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';
import { fromArrayBuffer } from 'geotiff';
import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import { fromLonLat } from 'ol/proj';
import WebGLTileLayer from 'ol/layer/WebGLTile';   // GeoTIFF
import TileLayer from 'ol/layer/Tile';
import Static from 'ol/source/ImageStatic';
import XYZ from 'ol/source/XYZ';
import { GeoTIFF as olGeoTIFF } from 'ol/source';


@Component({
    selector: 'app-geotiff-preview',
    templateUrl: 'geotiff-preview.component.html',
    styleUrls: ['geotiff-preview.component.scss']
})


export class GeoTiffPreviewComponent implements AfterViewInit, OnInit, PreviewComponent {

    // Data will be a URL to the server's getImagePreview endpoint
    data: any;
    atBottom: boolean = false;
    previewMap: Map;
    layer: ImageLayer<Static>;
    layerOpacity: number;


    constructor() { }

    ngOnInit() {
        this.layerOpacity = 100;
        const mapImagerySource = new XYZ({
            attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">ArcGIS</a>',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            maxZoom: 18
        });
        const mapBoundariesSource = new XYZ({
            attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer">ArcGIS</a>',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
            maxZoom: 18
        });
        const nswVicLonLat = [146.345960, -33.247876];
        const nswVicWebMercator = fromLonLat(nswVicLonLat);
        this.previewMap = new Map({
            target: 'previewMap',
            controls: [],
            layers: [
                // Baselayers
                new TileLayer({
                    preload: Infinity,
                    source: mapImagerySource
                }),
                new TileLayer({
                    preload: Infinity,
                    source: mapBoundariesSource
                })
            ],
            view: new View({
                //projection: "EPSG:4326",
                center: nswVicWebMercator,
                zoom: 5
            })
        });
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
        // Left for revisiting
        console.log(bbox);
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
        this.layer = new ImageLayer({
            source: source
        });
        this.previewMap.addLayer(this.layer);
        const layerCenterLonLat = [ (bbox[2] - ((bbox[2] - bbox[0])/2)), (bbox[3] - ((bbox[3] - bbox[1])/2))];
        const layerWebMercator = fromLonLat(layerCenterLonLat);
        this.previewMap.getView().animate({
            zoom: 8,
            center: layerWebMercator,
            duration: 250
        });
    }

    /**
     * 
     * @param e 
     */
    public setLayerOpacity(e: any) {
        this.layerOpacity = e.value;
        this.layer.setOpacity(e.value / 100);
    }

}
