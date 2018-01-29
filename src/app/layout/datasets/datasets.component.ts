import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

import { Observable } from 'rxjs/Observable';

import { CSWService } from './models/csw-service.model';
import { VGLService } from './services/vgl.service';

// XXX TESTING
import { CSWServiceInterface } from './models/csw-service.model';


// Drawing modes
export enum DrawingMode {
    NONE = 0,
    SPATIAL_BOUNDS = 1,
    DATA_SELECTION = 2,
    ZOOM = 4
}


declare let google: any;


@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
    styleUrls: ['./datasets.component.scss'],
    animations: [routerTransition()]
})


/**
 * BUGS:
 * 
 * 1. Drawing spatial bounds doesn't update the UI until something is clicked.
 *    Why?
 * 
 * TODO:
 * 
 * 1. Limit number of rectangles/polygons that can exist on map.
 * 2. User can edit/move rectangle/polygon but it has no effect on linked data
 *    (e.g. spatial bounds). We can disable editing or add another enum type.
 * 3. Have disabled polygons to match VGL. Can polygons even be used in the
 *    backend? Reinstate if useful.
 */
export class DatasetsComponent implements OnInit {

    // Default map settings
    private lat: number;
    private lng: number;
    private zoom: number;

    // GoogleMap objects
    map: any;
    drawingManager: any;
    spatialBoundsRect: any;
    selectDataRect: any;

    // Readable version of requested map bounds (UI)
    spatialBoundsDisplay: string = null;

    // Drawing mode
    drawingMode = DrawingMode.NONE;


    constructor(private vglService: VGLService) {
        console.log("CONSTRUCT");
    }

 
    ngOnInit() {
        console.log("INIT");
        this.lat = -24.994;
        this.lng = 134.824;
        this.zoom = 4;
        /*
        let dataSelectPolygon = {
            draggable:true,
            editable:true,
            fillColor:"#acbcff"
        };
        */
        let dataSelectRect = {
            draggable:true,
            editable:true,
            fillColor:"#acbcff"
        };

        this.map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: this.lat, lng: this.lng },
            zoom: 4,
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            fullscreenControl: false,
            streetViewControl: false
        });

        this.drawingManager = new google.maps.drawing.DrawingManager({
            //drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
            drawingControl: false,
            //polygonOptions:dataSelectPolygon,
            rectangleOptions:dataSelectRect,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT,
                drawingModes: [ /*'polygon', */'rectangle' ]
            }
        });

        google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => this.drawingOverlayComplete(event));
        // XXX Custom draw tools better allow us to capture start drawing events
        //google.maps.event.addListener(this.drawingManager, 'drawingmode_changed', (event) => this.clearDataSelection(event));

        this.drawingManager.setMap(this.map);
        this.drawingManager.setDrawingMode(null);
        this.drawingMode = DrawingMode.NONE;
    }


    /**
     * Grab tool clicked
     */
    grabClicked() {
        this.drawingMode = DrawingMode.NONE;
        this.drawingManager.setDrawingMode(null);
    }


    /**
     * Draw tool clicked
     */
    drawClicked() {
        if(this.drawingMode != DrawingMode.DATA_SELECTION) {
            this.clearSelectDataRect();
        }
        this.drawingMode = DrawingMode.DATA_SELECTION;
        this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
    }


    /**
     * Zoom tool clicked
     */
    zoomClicked() {
        this.drawingMode = DrawingMode.ZOOM;
        this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
    }


    /**
     * Remove the spatial bounds rectangle from the map
     */
    clearSpatialBounds() {
        if(this.spatialBoundsRect) {
            this.spatialBoundsRect.setMap(null);
            this.spatialBoundsRect = null;
        }
    }


    /**
     * Remove the data selection rectangle from the map
     */
    clearSelectDataRect() {
        if(this.selectDataRect) {
            this.selectDataRect.setMap(null);
            this.selectDataRect = null;
        }
    }


    /**
     * Update the spatial bounds text input with a formatted bounds string.
     * 
     * @param bounds bounds provided from the map or a drawn rectangle
     */
    updateSpatialBoundsUI(bounds) {
        let neLat = bounds.getNorthEast().lat().toFixed(4);
        let neLng = bounds.getNorthEast().lng().toFixed(4);
        let swLat = bounds.getSouthWest().lat().toFixed(4);
        let swLng = bounds.getSouthWest().lng().toFixed(4);
        this.spatialBoundsDisplay = neLng + ", " + neLat + " to " + swLat +
            ", " + swLng;
    }


    /**
     * User setting bounds from either of the 'Spatial Bounds' buttons (current
     * or draw).
     * 
     * @param type One of 'current' (current map bounds) or 'draw' (user will
     * draw a rectangle on the map)
     */
    selectSpatialBounds(type) {
        // Clear any existing drawn bounds on map
        this.clearSpatialBounds();
        // User to draw bounds on map
        if(type==='draw-bounds') {
            this.drawingMode = DrawingMode.SPATIAL_BOUNDS;
            this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
        }
        // Get current map bounds
        else if(type==='current-bounds') {
            this.drawingMode = DrawingMode.NONE;
            this.drawingManager.setDrawingMode(null);
            this.updateSpatialBoundsUI(this.map.getBounds());
        }
    }


    /**
     * Called after a user finishes drawing a polygon or rectangle on the map.
     * May be called after drawing spatial bounds, drawing data selection area,
     * or drawing the zoom rectangle.
     * 
     * @param event The drawing event, will be either polygon or rectangle
     */
    drawingOverlayComplete(event) {
        // User is selecting data via rectangle or polygon
        if(this.drawingMode===DrawingMode.DATA_SELECTION) {
            /*
            if(event.type==='rectangle') {
                let rectBounds = event.overlay.bounds;
            } else if (event.type==='polygon') {
                let poly = event.overlay.getPath().getArray();
                //console.log('poly: ' + poly);
            }*/
            this.selectDataRect = event.overlay;

            // Select data

        }
        // User was drawing bounds
        else if(this.drawingMode===DrawingMode.SPATIAL_BOUNDS) {
            this.updateSpatialBoundsUI(event.overlay.bounds);
            this.spatialBoundsRect = event.overlay;
        }
        // User has drawn zoom rectangle
        else if(this.drawingMode===DrawingMode.ZOOM) {
            this.map.fitBounds(event.overlay.bounds);
            event.overlay.setMap(null);
        }
        // Reset drawing mode
        this.drawingManager.setDrawingMode(null);
        this.drawingMode = DrawingMode.NONE;
    }


    cswServices: CSWService[];


    // TODO: Get rid of this XXX
    testButton() {
        /*
        let cswServices = [];
        this.vglService.testMethod().subscribe((services: Array<CSWService>) => {
            cswServices = services;
        });
        */
        let cswServices = [];
        //this.vglService.getCSWServices().subscribe(response => {
        this.vglService.getCSWServices().subscribe((response: CSWService[]) => {
            for(let s of response) {
                console.log(s.title);
            }
        }), err => {
            console.log("Error retrieving CWS services: " + err.message);
        };

        //console.log("SSS: " + this.cswServices.length);
    }


    addRecord() {
        // TODO: Check if layer exists

        // TODO: Turn our KnownLayer/CSWRecord into an actual Layer

        // TODO: If newLayer is undefined, it must have come from some other source like mastercatalogue

        //TODO: We may need to show a popup window with copyright info

        // TODO: Add layer to store

        // TODO: Ensure new layer is selected in layersPanel

    }

}