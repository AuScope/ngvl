import { Component, AfterViewInit } from '@angular/core';
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

    // Inputs
    parameter: string;
    x: number;
    y: number;

    // Current status of querying
    status: number = this.QueryStatus.querying;

    // Graph data
    public graph = {
        data: [],
        layout: {autosize: true, title: this.parameter}
    };

    constructor(private graceService: GraceService, public activeModal: NgbActiveModal) { }

    ngAfterViewInit() {
        this.graph.layout.title = this.parameter;
        // Make call to GRACE service to get data
        this.graceService.getTimeSeriesData(this.parameter, this.x, this.y).subscribe(data => {
            // Plot graph
            this.graph.layout.title = '<b>Value: ' + this.parameter + '</b><br>' +
                'Primary Mascon: ' + data.primary_mascon_id +
                ', Ternary Mascon: ' + data.ternary_mascon_id;
            this.graph.data = [
                { x: data.x_plot, y: data.y_plot, type: 'scatter', mode: 'lines+points', marker: {color: 'blue'} }
            ];
            this.status = this.QueryStatus.loaded;
        }, error => {
            this.status = this.QueryStatus.error;
        });
    }
}
