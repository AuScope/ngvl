import { Component, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JobsService } from '../../../layout/jobs/jobs.service';
import { saveAs } from 'file-saver';


declare var Plotly: any;

/**
 * TODO: Catch modal close (or dismiss) and cancel InSAR query Subscription
 */
@Component({
    selector: 'app-insar-graph-modal-content',
    templateUrl: './insar-graph.modal.component.html',
    styleUrls: ['./insar-graph.modal.component.scss']
})
export class InsarGraphModalComponent implements AfterViewInit {

    QueryStatus = {
        querying: 0,
        loaded: 1,
        error: 2
    };

    // Lat/Lon inputs
    pixelX: number;
    pixelY: number;
    jobId: number;

    querySubscription: Subscription;
    status: number = this.QueryStatus.querying;

    queriedData: any;

    // Graph data
    public graph = {
        data: [],
        layout: {
            autosize: true,
            title: '',
            xaxis: {
                title: 'Date'
            },
            yaxis: {
                title: 'Cumulative Displacement (mm)'
            }
        },
        config: {
            displaylogo: false,
            modeBarButtonsToAdd: [{
                name: 'Download JSON data',
                icon: Plotly.Icons.disk,
                click: function() {
                    this.downloadData(this.queriedData);
                }.bind(this)
            }],
            modeBarButtonsToRemove: [
                'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'
            ]
        }
    };

    constructor(private jobsService: JobsService, public activeModal: NgbActiveModal) { }

    ngAfterViewInit() {
        this.queryTimeSeries();
    }

    private queryTimeSeries() {
        if (this.querySubscription) {
            this.querySubscription.unsubscribe();
        }
        this.status = this.QueryStatus.querying;
        const graphFile = "output/json/time_series_" + this.pixelY + ".zip";

        const arrayPosition = this.pixelX;
        this.jobsService.getJSONPreview(this.jobId, graphFile, arrayPosition, true).subscribe(data => {
            this.queriedData = JSON.parse(data);
            this.plotGraph();
            this.status = this.QueryStatus.loaded;
        }, error => {
            this.status = this.QueryStatus.error;
        });
    }

    private plotGraph() {
        for (let d = 0; d < this.queriedData.x.length; d++) {
            this.queriedData.x[d] = this.stringToDate(this.queriedData.x[d]);
        }
        for (let d = 0; d < this.queriedData.cx.length; d++) {
            this.queriedData.cx[d] = this.stringToDate(this.queriedData.cx[d]);
        }
        this.graph.data = [{ 
            x: this.queriedData.x,
            y: this.queriedData.y[0],
            mode: 'lines',
            marker: {color: 'red'},
            name: 'PyRate linear rate'
        }, {
            x: this.queriedData.x,
            y: this.queriedData.y[1],
            mode: 'lines',
            marker: {color: 'green'},
            name: 'Annual+L model'
        }, {
            x: this.queriedData.x,
            y: this.queriedData.y[2],
            mode: 'lines',
            marker: {color: 'orange'},
            name: 'Quad model'
        }, {
            x: this.queriedData.x,
            y: this.queriedData.y[3],
            mode: 'lines',
            marker: {color: 'yellow'},
            name: 'Annual+Q model'
        }, {
            x: this.queriedData.cx,
            y: this.queriedData.cy[0],
            mode: 'scatter',
            marker: {color: 'blue'},
            name: 'tscuml'
        }]
        const title = '<b>Velocity = ' + this.queriedData.v + ' +/- ' + this.queriedData.e + ' [mm/yr] @(' +
                this.pixelX + ', ' + this.pixelY + ')';
        this.graph.layout = {
            autosize: true,
            title: title,
            xaxis: {
                title: 'Date'
            },
            yaxis: {
                title: 'Height (m)'
            }
        };
    }

    private stringToDate(d: string): string {
        d = d.substring(0, 4) + '-' + d.substring(4, 6) + '-' + d.substring(6)
        return d;
    }

    /**
     * 
     * @param data 
     */
    public downloadData(data: any) {
        const blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, data.primary_mascon_id + ".json");
    }

}
