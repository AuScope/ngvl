import { Component, OnInit } from "@angular/core";
import { GraceStyleSettings } from "./grace-graph.models";
import { GraceService } from "./grace.service";


@Component({
    selector: 'app-grace-style-legend',
    templateUrl: './grace-style-legend.component.html',
    styleUrls: ['./grace-style-legend.component.scss']
})

export class GraceStyleLegendComponent implements OnInit {

    graceStyleSettings: GraceStyleSettings;
    //maxBackground = "black;"
    //minBackground = "black;"

    constructor(private graceService: GraceService) { }

    ngOnInit() {
        this.graceStyleSettings = {
            minColor: '#ff0000',
            minValue: -1,
            neutralColor: '#ffffff',
            neutralValue: 0,
            maxColor: '#0000ff',
            maxValue: 1,
            transparentNeutralColor: false
        };
        this.graceService.graceStyleSettings.subscribe(graceStyleSettintgs => {
            this.graceStyleSettings = graceStyleSettintgs;
        });
    }

}
