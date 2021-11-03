import { KeywordComponentType } from "../app/shared/modules/keyword/models";
import { OlMapGraceDataComponent } from "../app/shared/modules/grace/olmap.grace-data.component";
import { GraceStyleComponent } from "../app/shared/modules/grace/grace-style.component";

  /**
   * Components defined here will be loaded onto either the map or
   * dataset-record component as a KeywordComponent provided the keyword
   * name is found within the CSW record keyword list of an active layer.
   */
  export const keywordComponents = {
    keywordComponents: [{
      keyword: "grace",
      keywordComponent: OlMapGraceDataComponent,
      keywordComponentType: KeywordComponentType.MapWidget
    }, {
      keyword: "grace",
      keywordComponent: GraceStyleComponent,
      keywordComponentType: KeywordComponentType.RecordButton
    }
  ]
};
