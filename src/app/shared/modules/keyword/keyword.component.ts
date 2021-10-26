import { Type } from '@angular/core';
import { KeywordComponentType } from './models';
import { CSWRecordModel } from 'portal-core-ui';

export class KeywordComponent {
  keyword: string;
  keywordComponentType: KeywordComponentType;
  keywordComponent: Type<any>;
  // Currently record button specific
  cswRecord?: CSWRecordModel;

  constructor(keyword: string, keywordComponentType: KeywordComponentType, keywordComponent: Type<any>) {
    this.keyword = keyword;
    this.keywordComponentType = keywordComponentType;
    this.keywordComponent = keywordComponent;
  }

}
