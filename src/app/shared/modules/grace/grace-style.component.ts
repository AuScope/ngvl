import { Component } from '@angular/core';
import { GraceStyleSettings } from './grace-graph.models';
import { GraceStyleService } from './grace-style.service';
import { StyleChooserModalComponent } from './style-chooser.modal.component';
import { KeywordComponentClass } from '../keyword/models';
import { OlMapService } from 'portal-core-ui';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'app-grace-style',
    templateUrl: './grace-style.component.html',
    styleUrls: ['./grace-style.component.scss', '../../../layout/datasets/datasets-record/datasets-record.component.scss']
})
export class GraceStyleComponent extends KeywordComponentClass {

    private graceStyleSettings: GraceStyleSettings;

    constructor(private olMapService: OlMapService, public modalService: NgbModal) {
        super();
    }

    /**
     * Set the WMS style for the layer
     *
     * @param record CSW record
     */
    changeGraceStyle() {
        if (this.graceStyleSettings === undefined || this.graceStyleSettings === null) {
            this.graceStyleSettings = {
                minColor: '#ff0000',
                minValue: -8,
                neutralColor: '#ffffff',
                neutralValue: 0,
                maxColor: '#0000ff',
                maxValue: 4,
                transparentNeutralColor: false
            };
        }
        const modalRef = this.modalService.open(StyleChooserModalComponent, { size: 'sm' });
        modalRef.componentInstance.graceStyleSettings = this.graceStyleSettings;
        modalRef.result.then(newStyle => {
            this.graceStyleSettings = {
                minColor: newStyle.minColor,
                minValue: newStyle.minValue,
                neutralColor: newStyle.neutralColor,
                neutralValue: newStyle.neutralValue,
                maxColor: newStyle.maxColor,
                maxValue: newStyle.maxValue,
                transparentNeutralColor: newStyle.transparentNeutralColor
            };
            const sld = GraceStyleService.getGraceSld('mascons_stage4_V003a', 'mascon_style', this.graceStyleSettings);
            this.olMapService.setLayerSourceParam(this.cswRecord.id, 'LAYERS', undefined);
            this.olMapService.setLayerSourceParam(this.cswRecord.id, 'SLD_BODY', sld);
        }, () => {});
    }
}
