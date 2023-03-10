import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GraceService } from './grace.service';
import { GraceStyleSettings } from './grace-graph.models';
import { saveAs } from 'file-saver';


@Component({
    selector: 'app-create-animation-modal-content',
    templateUrl: './create-animation.modal.component.html',
    styleUrls: ['./create-animation.modal.component.scss']
})
export class CreateAnimationModalComponent implements OnInit {

    @Input() graceStyleSettings: GraceStyleSettings;
    @Input() dates: Date[] = [];

    AnimationStatus = {
        None: 0,
        Loading: 1,
        Loaded: 2
    };

    DECIMAL_REGEX = "^-?\\d*\.{0,1}\\d+$";
    INTEGER_REGEX = "^[0-9]+$";

    animationGroup: FormGroup;
    animationStatus: number;

    loadingDates = true;
    creatingVideo = false;

    // Bounds (Aus defaults)
    westBound = 113.338953078;
    southBound = -43.6345972634;
    eastBound = 153.569469029;
    northBound = -10.6681857235;


    constructor(private graceService: GraceService, public activeModal: NgbActiveModal, private formBuilder: FormBuilder) {}


    ngOnInit() {
        this.animationGroup = this.formBuilder.group({
            layer: "",
            startdate: [null, [Validators.required]],
            enddate: [null, [Validators.required]],
            westBound: [this.westBound, [Validators.required, Validators.pattern(this.DECIMAL_REGEX)]],
            southBound: [this.southBound, [Validators.required, Validators.pattern(this.DECIMAL_REGEX)]],
            eastBound: [this.eastBound, [Validators.required, Validators.pattern(this.DECIMAL_REGEX)]],
            northBound: [this.northBound, [Validators.required, Validators.pattern(this.DECIMAL_REGEX)]],
            fps: [1, [Validators.required, Validators.pattern(this.INTEGER_REGEX)]],
            framewidth: [600, [Validators.required, Validators.pattern(this.DECIMAL_REGEX)]],
            frameheight: [450, [Validators.required, Validators.pattern(this.DECIMAL_REGEX)]]
        });
        this.animationStatus = this.AnimationStatus.None;
        this.graceService.getGraceDates().subscribe(dates => {
            this.dates = dates;
            this.loadingDates = false;
            this.animationGroup.value.startDate = dates[0];
            this.animationGroup.value.endDate = this.dates[this.dates.length - 1];
        }, error => {
            console.log('Error loading dates: ' + error.message);
        });
    }

    /*
    changeStyle() {
        // TODO: Do
        console.log("Change style...");
    }
    */

    onSubmit() {
        // TODO: Remove hard-coding
        this.animationGroup.value.layer = "grace:grace_view";
        this.animationGroup.value.dates = this.dates.slice(this.dates.indexOf(this.animationGroup.value.startdate), this.dates.indexOf(this.animationGroup.value.enddate) + 1);
        this.animationStatus = this.AnimationStatus.Loading;
        this.graceService.createAnimation(this.animationGroup.value).subscribe( (data: any) => {
            saveAs(data, "mascons.mp4");
            this.animationStatus = this.AnimationStatus.Loaded;
        }, error => {
            console.error(error);
            this.animationStatus = this.AnimationStatus.None;
        });
    }

}
