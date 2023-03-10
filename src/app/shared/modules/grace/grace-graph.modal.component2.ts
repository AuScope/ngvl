import { Component, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GraceService } from './grace.service';
import { saveAs } from 'file-saver';


declare var Plotly: any;

/**
 * TODO: Catch modal close (or dismiss) and cancel GRACE query Subscription
 */
@Component({
    selector: 'app-grace-graph-modal-content2',
    templateUrl: './grace-graph.modal.component2.html',
    styleUrls: ['./grace-graph.modal.component2.scss']
})
export class GraceGraphModalComponent2 implements AfterViewInit {

    QueryStatus = {
        querying: 0,
        loaded: 1,
        error: 2
    };

    showUncertainty = true;

    // Lat/Lon inputs or coordinate array of lat/lon for polys
    x: number;
    y: number;
    coords: any[];
    centroid: string;

    querySubscription: Subscription;
    status: number = this.QueryStatus.querying;

    queriedData: any = {};

    // Graph data
    public graph = {
        data: [{
            x: [],
            y: [],
            mode: 'lines+points',
            marker: {
                color: 'blue'
            },
            // TODO: Errors if needed
            error_y: {},
            type: 'scatter'
        }],
        layout: {
            autosize: true,
            title: "Equivalent Water Height (EWH)",
            xaxis: {
                title: 'Date'
            },
            yaxis: {
                title: 'Equivalent Water Height (m)'
            }
        },
        config: {
            displaylogo: false,
            displayModeBar: true,   // client wants buttons always visible
            modeBarButtonsToAdd: [{
                name: 'Download JSON data',
                icon: Plotly.Icons.disk,
                click: function() {
                    this.downloadData();
                }.bind(this)
            }],
            modeBarButtonsToRemove: [
                'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'
            ]
        }
    };

    constructor(private graceService: GraceService, public activeModal: NgbActiveModal, public modalService: NgbModal) {}

    ngAfterViewInit() {
        this.queryTimeSeries();
    }

    parseCentroid(centroid: string): string {
        const lon = Number(centroid.substring(centroid.indexOf('(') + 1, centroid.indexOf(' '))).toFixed(2);
        const lat = Number(centroid.substring(centroid.indexOf(' ') + 1, centroid.indexOf(')'))).toFixed(2);
        return lat + ', ' + lon;
    }

    private queryTimeSeries() {
        if (this.querySubscription) {
            this.querySubscription.unsubscribe();
        }
        this.status = this.QueryStatus.querying;
        // Make call to GRACE service to get data for single parameter
        if (this.x !== undefined && this.y !== undefined) {
            this.querySubscription = this.graceService.getGraceTimeSeriesDataForPoint(this.x, this.y).subscribe(data => {
                this.queriedData = data;
                const centroid = this.parseCentroid(data.response.centroid);
                const title = '<b>Equivalent Water Height (EWH)</b><br>' +
                    'Primary Mascon: ' + data.response.primary_mascon_id + ' (' + centroid +')<br>' +
                    'Area: ' + (data.response.total_area / 1000000).toFixed(3) + 'km<sup>2</sup>';
                this.plotGraph(title, data.response);
                this.status = this.QueryStatus.loaded;
            }, error => {
                this.status = this.QueryStatus.error;
            });
        } else if (this.coords !== undefined && this.coords.length > 0) {
            // TODO: Remove hard-coding... will need to be a record keyword component
            this.querySubscription = this.graceService.getGraceTimeSeriesDataForPolygon(this.coords).subscribe(data => {
                this.queriedData = data;
                const title = '<b>Equivalent Water Height (EWH) for Region</b><br>' +
                    'Primary Mascons: ' + data.response.primary_mascons + '<br>' +
                    'Total Area: ' + (data.response.total_area / 1000000).toFixed(3) + 'km<sup>2</sup>';
                // TODO: New plot for multiple mascons
                this.plotGraph(title, data.response);
                this.status = this.QueryStatus.loaded;
            }, error => {
                console.log("Error retrieving data: " + error);
                this.status = this.QueryStatus.error;
            });
        }
    }

    plotGraph(title: string, data: any) {
        let errorPlot = {};
        if (data.hasOwnProperty('error_y')) {
            errorPlot = {
                type: 'data',
                array: data.error_y,
                color: 'purple',
                visible: true
            };
        }

        this.graph.data = [{
            x: this.graph.data[0].x = data.graph_x,
            y: this.graph.data[0].y = data.graph_y,
            mode: 'lines+points',
            marker: {
                color: 'blue'
            },
            // TODO: Errors if needed
            error_y: errorPlot,
            type: 'scatter' }
        ];
        this.graph.layout = {
            autosize: true,
            title: title,
            xaxis: {
                title: 'Date'
            },
            yaxis: {
                title: 'Equivalent Water Height (m)'
            }
        };
    }

    public downloadData() {
        const blob = new Blob([JSON.stringify(this.queriedData)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "mascon_data.json");
    }

}
