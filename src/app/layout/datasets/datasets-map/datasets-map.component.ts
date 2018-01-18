//import { AgmMap, MouseEvent } from '@agm/core';
import { Component, EventEmitter, OnInit } from '@angular/core';

declare var google: any;


@Component({
    selector: 'datasets-map',
    templateUrl: './datasets-map.component.html',
    styleUrls: ['./datasets-map.component.scss'],
})


export class DatasetsMapComponent implements OnInit {

    // Default map settings
    lat: number = -24.994;
    lng: number = 134.824;
    zoom: number = 4;

    // Google Maps objects
    map: any;
    drawingManager: any;


    constructor() {}


    selectData(event) {
        if(event.type==='rectangle') {
            var bounds = event.overlay.bounds;
            console.log('Rect: ' + bounds);
        } else if (event.type==='polygon') {
            console.log('Poly');
            var poly = event.overlay.getPath().getArray();
            console.log('poly: ' + poly);
        }
    }


    ngOnInit() {
        var dataSelectPolygon = {
            draggable:true,
            editable:true,
            fillColor:"#acbcff"
        };

        var dataSelectRect = {
            draggable:true,
            editable:true,
            fillColor:"#acbcff"
        };

        this.map = new google.maps.Map(document.getElementById('map'), {
            center: { lat:this.lat, lng: this.lng },
            zoom: 4
        });

        this.drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            polygonOptions:dataSelectPolygon,
            rectangleOptions:dataSelectRect,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT,
                drawingModes: [ 'polygon', 'rectangle' ]
            
            }
        });

        /*
        google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (event) => {
            // Polygon drawn
            var poly = event.overlay.getPath().getArray();
            alert("POlycomplete");
            
        });
        */

        google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => this.selectData(event));

        this.drawingManager.setMap(this.map);
    }

    /*
    // agm events
    mapClicked(event: EventEmitter<MouseEvent>) {
        console.log("mapClick: " + event.coords.lat);
    }

    mouseUp(event: EventEmitter<MouseEvent>) {
        console.log("mouseUp: " + event);
    }

    mouseDown(event: EventEmitter<MouseEvent>) {
        console.log("mouseDown: " + event);
    }

    mapReady(event: EventEmitter<any>) {
        console.log("mapReady");
    }
    */
}
