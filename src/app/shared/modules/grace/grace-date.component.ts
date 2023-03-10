import { Component, OnInit } from "@angular/core";
import { GraceService } from "./grace.service";


@Component({
    selector: 'app-grace-date',
    templateUrl: './grace-date.component.html',
    styleUrls: ['./grace-date.component.scss']
})

export class GraceDateComponent implements OnInit {

    public graceDate: Date = null;

    constructor(private graceService: GraceService) { }

    ngOnInit() {
        this.graceService.graceDate.subscribe(graceDate => {
            this.graceDate = graceDate;
        });
    }

}
