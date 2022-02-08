import { Component, OnInit } from '@angular/core';
import { GraceStyleSettings } from './grace-graph.models';
import { GraceStyleService } from './grace-style.service';
import { StyleChooserModalComponent } from './style-chooser.modal.component';
import { KeywordComponentClass } from '../keyword/models';
import { OlMapService } from 'portal-core-ui';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GraceService } from './grace.service';


@Component({
    selector: 'app-grace-style',
    templateUrl: './grace-style.component.html',
    styleUrls: ['./grace-style.component.scss', '../../../layout/datasets/datasets-record/datasets-record.component.scss']
})
export class GraceStyleComponent extends KeywordComponentClass implements OnInit {

    private graceStyleSettings: GraceStyleSettings;

    constructor(private olMapService: OlMapService, public modalService: NgbModal, private graceService: GraceService) {
        super();
    }

    ngOnInit() {
        this.graceService.graceStyleSettings.subscribe(garceStyleSettings => {
            this.graceStyleSettings = this.graceStyleSettings;
        });
    }

    /**
     * Get the layer name of the first WMS resource for this component's CSW record
     */
    private getWMSLayerName(): string {
        let wmsLayerName = '';
        for (const onlineResource of this.cswRecord.onlineResources) {
            if (onlineResource.type.toLowerCase() === 'wms') {
                wmsLayerName = onlineResource.name;
                break;
            }
        }
        return wmsLayerName;
    }

    /**
     * Set the WMS style for the layer
     *
     * @param record CSW record
     */
    changeGraceStyle() {
        const layerName = this.getWMSLayerName();
        const modalRef = this.modalService.open(StyleChooserModalComponent, { size: 'sm' });

        modalRef.result.then(newStyle => {
            this.graceService.setGraceStyleSettings({
                minColor: newStyle.minColor,
                minValue: newStyle.minValue,
                neutralColor: newStyle.neutralColor,
                neutralValue: newStyle.neutralValue,
                maxColor: newStyle.maxColor,
                maxValue: newStyle.maxValue,
                transparentNeutralColor: newStyle.transparentNeutralColor
            });
            //const sld = GraceStyleService.getGraceSld(layerName, 'mascon_style', this.graceStyleSettings);
            const sld = GraceStyleService.getGraceSld(layerName, 'mascon_style', newStyle);
            this.olMapService.setLayerSourceParam(this.cswRecord.id, 'LAYERS', undefined);
            this.olMapService.setLayerSourceParam(this.cswRecord.id, 'SLD_BODY', sld);
            
        }, () => {});
    }

}
