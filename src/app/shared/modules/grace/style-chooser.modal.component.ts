import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GraceService } from './grace.service';


@Component({
    selector: 'app-style-chooser-modal-content',
    templateUrl: './style-chooser.modal.component.html',
    styleUrls: ['./style-chooser.modal.component.scss']
})
export class StyleChooserModalComponent implements OnInit {

    DECIMAL_REGEX = "^-?\\d*\.{0,1}\\d+$";

    styleGroup: FormGroup;


    constructor(public activeModal: NgbActiveModal, private formBuilder: FormBuilder, private graceService: GraceService) {}


    ngOnInit() {
        this.graceService.graceStyleSettings.subscribe(graceStyleSettings => {
            this.styleGroup = this.formBuilder.group({
                minColor: graceStyleSettings.minColor,
                minValue: [graceStyleSettings.minValue, [Validators.required, Validators.pattern(this.DECIMAL_REGEX)]],
                neutralColor: graceStyleSettings.neutralColor,
                neutralValue: [graceStyleSettings.neutralValue, [Validators.required, Validators.pattern(this.DECIMAL_REGEX)]],
                maxColor: graceStyleSettings.maxColor,
                maxValue: [graceStyleSettings.maxValue, [Validators.required, Validators.pattern(this.DECIMAL_REGEX)]],
                transparentNeutralColor: graceStyleSettings.transparentNeutralColor
            });
        });
    }

    onSubmit() {
        this.activeModal.close(this.styleGroup.value);
    }

}
