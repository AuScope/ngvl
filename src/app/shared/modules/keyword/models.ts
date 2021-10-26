import { ViewContainerRef } from '@angular/core';
import { KeywordComponent } from "./keyword.component";
import { CSWRecordModel } from 'portal-core-ui';

export enum KeywordComponentType {
    'MapWidget',
    'RecordButton'
}

export interface AddedKeywordComponent {
    cswRecordIds: string[];
    keywordComponent: KeywordComponent;
    viewContainerRef: ViewContainerRef;
}

export abstract class KeywordComponentClass {

    public cswRecord: CSWRecordModel;

    public getCSWRecord(): CSWRecordModel {
        return this.cswRecord;
    }

    public setCSWRecord(cswRecord: CSWRecordModel) {
        this.cswRecord = cswRecord;
    }
}
