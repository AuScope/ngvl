import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';


// Drawing modes
export enum DrawingMode {
    NONE = 0,
    SPATIAL_BOUNDS = 1,
    DATA_SELECTION = 2
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
 * 1. Drawing spatial bounds doesn't update the UI until it's clicked. Why?
 * 
 * TODO:
 * 
 * 1. Limit number of rectangles/polygons that can exist on map.
 * 2. User can modify rectangle/polygon but it has no effect on linked data
 *    (e.g. spatial bounds). We can disable editing or add another enum type.
 * 3. Have disabled polygons to match VGL. Can polygons even be used in the
 *    backend? Can easily reinstate if useful.
 */
export class DatasetsComponent implements OnInit {

    // Default map settings
    lat: number = -24.994;
    lng: number = 134.824;
    zoom: number = 4;

    // GoogleMap objects
    map: any;
    drawingManager: any;
    spatialBoundsRect: any;
    selectDataObject: any;

    // Readable version of requested map bounds (UI)
    spatialBoundsDisplay: string = null;

    // Drawing mode
    drawingMode = DrawingMode.NONE;


    constructor() {}


    ngOnInit() {
        let dataSelectPolygon = {
            draggable:true,
            editable:true,
            fillColor:"#acbcff"
        };

        let dataSelectRect = {
            draggable:true,
            editable:true,
            fillColor:"#acbcff"
        };

        this.map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: this.lat, lng: this.lng },
            zoom: 4
        });

        this.drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            polygonOptions:dataSelectPolygon,
            rectangleOptions:dataSelectRect,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT,
                drawingModes: [ /*'polygon', */'rectangle' ]
            }
        });

        this.drawingManager.setMap(this.map);

        google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => this.drawingOverlayComplete(event));
        //google.maps.event.addListener(this.drawingManager, 'drawingmode_changed', (event) => this.clearDataSelection(event));

        this.drawingMode = DrawingMode.NONE;
    }


    /**
     * Grab tool clicked
     */
    grabClicked() {
    }


    /**
     * Draw tool clicked
     */
    drawClicked() {
    }


    /**
     * Zoom tool clicked
     */
    zoomClicked() {
    }


    clearSpatialBounds() {
        if(this.spatialBoundsRect) {
            this.spatialBoundsRect.setMap(null);
            this.spatialBoundsRect = null;
        }
    }


    clearSelectDataObject() {
        if(this.selectDataObject) {
            this.selectDataObject.setMap(null);
            this.selectDataObject = null;
        }
    }

    clearDataSelection(event) {
        if(this.drawingMode!=DrawingMode.SPATIAL_BOUNDS) {
            this.clearSelectDataObject();
        }
    }

    /**
     * Update the spatial bounds text input with a formatted bounds string.
     * 
     * @param bounds bounds provided from the map or a drawn rectangle
     */
    updateSpatialBoundsDisplay(bounds) {
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
        // Clear any existing bounds on map
        this.clearSpatialBounds();

        // User to draw bounds on map
        if(type==='draw') {
            this.drawingMode = DrawingMode.SPATIAL_BOUNDS;
            this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
        }
        // Get current map bounds
        else if(type==='current') {
            this.drawingMode = DrawingMode.NONE;
            this.drawingManager.setDrawingMode(null);
            this.updateSpatialBoundsDisplay(this.map.getBounds());
        }
    }


    /**
     * Called after a user finishes drawing a polygon or rectangle on the map.
     * 
     * @param event The drawing event, either polygon or rectangle
     */
    drawingOverlayComplete(event) {
        // User is selecting data via rectangle or polygon
        if(this.drawingMode===DrawingMode.DATA_SELECTION) {
            if(event.type==='rectangle') {
                let rectBounds = event.overlay.bounds;
            } else if (event.type==='polygon') {
                let poly = event.overlay.getPath().getArray();
                //console.log('poly: ' + poly);
            }
            console.log("Set data object");
            this.selectDataObject = event.overlay;
        }
        // User was drawing bounds
        else if(this.drawingMode===DrawingMode.SPATIAL_BOUNDS) {
            this.updateSpatialBoundsDisplay(event.overlay.bounds);
            this.spatialBoundsRect = event.overlay;
        }
        // Rest drawing mode
        this.drawingManager.setDrawingMode(null);
        this.drawingMode = DrawingMode.NONE;
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