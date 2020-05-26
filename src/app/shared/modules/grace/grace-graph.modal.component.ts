import { Component, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GraceService } from './grace.service';


/**
 * TODO: Catch modal close (or dismiss) and cancel GRACE query Subscription
 */
@Component({
    selector: 'app-grace-graph-modal-content',
    templateUrl: './grace-graph.modal.component.html',
    styleUrls: ['./grace-graph.modal.component.scss']
})
export class GraceGraphModalComponent implements AfterViewInit {

    QueryStatus = {
        querying: 0,
        loaded: 1,
        error: 2
    };

    availableParameters = ['Estimate (with uncertainty)', 'Estimate'];

    // Inputs
    x: number;
    y: number;
    parameter: string = this.availableParameters[0];

    querySubscription: Subscription;
    status: number = this.QueryStatus.querying;

    queriedData: any;

    // Graph data
    public graph = {
        data: [],
        layout: {
            autosize: true,
            title: this.parameter,
            xaxis: {
                title: 'Date'
            },
            yaxis: {
                title: 'Height (m)'
            }
        }
    };

    constructor(private graceService: GraceService, public activeModal: NgbActiveModal) { }

    ngAfterViewInit() {
        this.queryTimeSeries();
    }

    private queryTimeSeries() {
        if (this.querySubscription) {
            this.querySubscription.unsubscribe();
        }
        this.status = this.QueryStatus.querying;
        // Make call to GRACE service to get data for single parameter
        this.querySubscription = this.graceService.getGraceAllTimeSeriesData(this.x, this.y).subscribe(data => {
            this.queriedData = data;
            this.plotGraph();
            this.status = this.QueryStatus.loaded;
        }, error => {
            this.status = this.QueryStatus.error;
        });
    }

    private plotGraph() {
        let x_vals: number[] = [];
        let y_vals: number[] = [];
        let error_vals: number[] = [];
        for (let row of this.queriedData.values) {
            x_vals.push(row['date']);
            y_vals.push(row['estimate']);
            if (this.parameter === this.availableParameters[0]) {
                error_vals.push(row['uncertainty']);
            }
        }
        let errorPlot;
        if (error_vals && error_vals.length > 0) {
            errorPlot = {
                type: 'data',
                array: error_vals,
                color: 'purple',
                visible: true
            };
        }
        this.graph.data = [{
            x: x_vals,
            y: y_vals,
            mode: 'lines+points',
            marker: {
                color: 'blue'
            },
            error_y: errorPlot,
            type: 'scatter' }
        ];
        const title = '<b>' + this.parameter + '</b><br>' +
            'Primary Mascon: ' + this.queriedData.primary_mascon_id +
            ', Ternary Mascon: ' + this.queriedData.ternary_mascon_id;
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

    public parameterChange(param: string) {
        this.parameter = param;
        this.plotGraph();
    }

}
