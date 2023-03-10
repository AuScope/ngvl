import { Component, OnInit, AfterViewInit } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';
import { fromArrayBuffer } from 'geotiff';
import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import { fromLonLat, transformExtent } from 'ol/proj';
import WebGLTileLayer from 'ol/layer/WebGLTile';   // GeoTIFF
import TileLayer from 'ol/layer/Tile';
import Static from 'ol/source/ImageStatic';
import XYZ from 'ol/source/XYZ';
import { GeoTIFF as olGeoTIFF } from 'ol/source';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { InsarGraphModalComponent } from "../../../shared/modules/grace/insar-graph.modal.component";


@Component({
    selector: 'app-geotiff-preview',
    templateUrl: 'geotiff-preview.component.html',
    styleUrls: ['geotiff-preview.component.scss']
})


export class GeoTiffPreviewComponent implements AfterViewInit, OnInit, PreviewComponent {

    // Data will be a URL to the server's getImagePreview endpoint
    data: any;
    options: any;   // This will be used to get the job ID
    atBottom: boolean = false;
    previewMap: Map;
    layer: ImageLayer<Static>;
    layerOpacity: number;

    imageLoaded: boolean = false;
    imageHeight: number;
    imageWidth: number;
    imageProjectedBoundingBox = []
    // Current pixel for mouseover image
    currentPixelX: number;
    currentPixelY: number;


    constructor(private modalService: NgbModal) { }

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

    getImagePixelCoordinate(evt) {
        const pixel = this.previewMap.getEventPixel(evt.originalEvent);
            const topLeftImagePixel = this.previewMap.getPixelFromCoordinate([this.imageProjectedBoundingBox[0], this.imageProjectedBoundingBox[3]]);
            const bottomRightImagePixel = this.previewMap.getPixelFromCoordinate([this.imageProjectedBoundingBox[2], this.imageProjectedBoundingBox[1]]);
            if(pixel[0] > topLeftImagePixel[0] && pixel[0] < bottomRightImagePixel[0] &&
               pixel[1] > topLeftImagePixel[1] && pixel[1] < bottomRightImagePixel[1]) {
                // Work out how far the point is along the dislayed image
                const adjustedPixel = [(pixel[0] - topLeftImagePixel[0]), (pixel[1] - topLeftImagePixel[1])]
                const pixelImageWidth = bottomRightImagePixel[0] - topLeftImagePixel[0];
                const pixelImageHeight = bottomRightImagePixel[1] - topLeftImagePixel[1];
                // Create a percentage multiplier and apply it to the original tif width/height to get XY value
                const xMultiplier = adjustedPixel[0] / pixelImageWidth;
                const yMultiplier = adjustedPixel[1] / pixelImageHeight;
                const x = Math.floor(this.imageWidth * xMultiplier);
                const y = Math.floor(this.imageHeight * yMultiplier);
                return [x, y];
            }
            return undefined;
    }

    async loadImage() {
        const url = this.data;
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const tiff = await fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage(); // by default, the first image is read.
        this.imageWidth = image.getWidth();
        this.imageHeight = image.getHeight();
        const bbox = image.getBoundingBox();
        this.imageProjectedBoundingBox = transformExtent(bbox, "EPSG:4326", "EPSG:3857");
        
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
        const canvas = document.createElement("canvas");
        canvas.width = this.imageWidth;
        canvas.height = this.imageHeight;
        const context = canvas.getContext("2d");
        const data = context.getImageData(0, 0, this.imageWidth, this.imageHeight);
        const rgba = data.data;
        let j = 0;
        if (rgb.length === (this.imageWidth * this.imageHeight * 3)) {
            for (let i = 0; i < rgb.length; i += 3) {
                rgba[j] = rgb[i];
                rgba[j + 1] = rgb[i + 1];
                rgba[j + 2] = rgb[i + 2];
                rgba[j + 3] = 255;
                j += 4;
            }
        } else if (rgb.length === (this.imageWidth * this.imageHeight)) {
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

        // Image clicks will display linear time series graph
        this.previewMap.on('click', (evt) => {
            const pixel = this.getImagePixelCoordinate(evt);
            if (pixel !== undefined) {
                const modalRef = this.modalService.open(InsarGraphModalComponent, { size: 'lg' });
                modalRef.componentInstance.pixelX = pixel[0];
                modalRef.componentInstance.pixelY = pixel[1];
                modalRef.componentInstance.jobId = this.options;
            }
        });

        // Mouse move over image will update XY display
        this.previewMap.on('pointermove', (evt) => {
            const pixel = this.getImagePixelCoordinate(evt);
            if (pixel !== undefined) {
                this.currentPixelX = pixel[0];
                this.currentPixelY = pixel[1];
            } else {
                this.currentPixelX = undefined;
                this.currentPixelY = undefined;
            }
        });

        this.imageLoaded = true;
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
