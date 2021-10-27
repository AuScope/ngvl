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
    @Input() dates: Date[];

    AnimationStatus = {
        None: 0,
        Loading: 1,
        Loaded: 2
    };

    DECIMAL_REGEX = "^-?\\d*\.{0,1}\\d+$";
    INTEGER_REGEX = "^[0-9]+$";

    animationGroup: FormGroup;
    animationStatus: number;


    constructor(private graceService: GraceService, public activeModal: NgbActiveModal, private formBuilder: FormBuilder) {}


    ngOnInit() {
        this.animationGroup = this.formBuilder.group({
            layer: "",
            startdate: [this.dates[0], [Validators.required]],
            enddate: [this.dates[this.dates.length - 1], [Validators.required]],
            fps: [1, [Validators.required, Validators.pattern(this.INTEGER_REGEX)]],
            framewidth: [600, [Validators.required, Validators.pattern(this.DECIMAL_REGEX)]],
            frameheight: [450, [Validators.required, Validators.pattern(this.DECIMAL_REGEX)]]
        });
        this.animationStatus = this.AnimationStatus.None;
    }

    /*
    changeStyle() {
        // TODO: Do
        console.log("Change style...");
    }
    */

    onSubmit() {
        // TODO: Remove hard-coding
        this.animationGroup.value.layer = "grace:test_mascons";
        //this.animationGroup.value.layer = "grace:mascons_stage4_V003a";
        this.animationGroup.value.dates = this.dates.slice(this.dates.indexOf(this.animationGroup.value.startdate), this.dates.indexOf(this.animationGroup.value.enddate) + 1);
        this.animationStatus = this.AnimationStatus.Loading;
        this.graceService.createAnimation(this.animationGroup.value).subscribe( (data: any) => {
            //console.log(JSON.stringify(data));
            saveAs(data, "mascons.mp4");
            this.animationStatus = this.AnimationStatus.Loaded;
        }, error => {
            console.error(error);
            this.animationStatus = this.AnimationStatus.None;
        });
    }

}
