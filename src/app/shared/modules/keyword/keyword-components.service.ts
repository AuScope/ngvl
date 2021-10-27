import { ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef } from "@angular/core";
import { KeywordComponent } from "./keyword.component";
import { AddedKeywordComponent, KeywordComponentType } from "./models";
import { CSWRecordModel } from "portal-core-ui";
import { keywordComponents } from "../../../../environments/keyword-components";

@Injectable({ providedIn: "root" })
export class KeywordComponentsService {

  private mapWidgetViewContainerRef: ViewContainerRef;

  // Added KeywordComponents
  private mapWidgetKeywordComponents: AddedKeywordComponent[] = [];
  private recordButtonKeywordComponents: AddedKeywordComponent[] = [];

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  /**
   * Set the ViewContainerRef for map widgets
   *
   * @param viewContainerRef map widget ViewContainerRef
   */
  public setMapWidgetViewContainerRef(viewContainerRef: ViewContainerRef) {
    this.mapWidgetViewContainerRef = viewContainerRef;
  }

  /**
   * Add any KeywordComponent map widgets if the CSW record contains the corresponding keywords
   *
   * @param cswRecord the CSW record
   */
  public addMapWidgetKeywordComponents(cswRecord: CSWRecordModel) {
    if (keywordComponents.hasOwnProperty("keywordComponents")) {
      for (const keyword of cswRecord.descriptiveKeywords) {
        const componentsForKeyword: KeywordComponent[] = keywordComponents[
          "keywordComponents"
        ].filter((c) => c.keyword === keyword);
        for (const keywordComponentItem of componentsForKeyword) {
          if (
            keywordComponentItem.keywordComponentType ===
            KeywordComponentType.MapWidget
          ) {
            // Map Widgets
            const addedKeywordComponents: AddedKeywordComponent[] = this.mapWidgetKeywordComponents.filter(
              (kc) => kc.keywordComponent === keywordComponentItem
            );
            if (addedKeywordComponents.length > 0) {
              // If this widget already exists, just update its CSW record ID list
              for (const addedComponent of addedKeywordComponents) {
                addedComponent.cswRecordIds.push(cswRecord.id);
              }
            } else {
              // If it doesn't already exist, add it
              const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
                keywordComponentItem.keywordComponent
              );
              const componentRef: ComponentRef<any> = this.mapWidgetViewContainerRef.createComponent<KeywordComponent>(componentFactory);
              componentRef.instance.cswRecord = cswRecord;

              const addedKeywordComponent: AddedKeywordComponent = {
                cswRecordIds: [cswRecord.id],
                keywordComponent: keywordComponentItem,
                viewContainerRef: this.mapWidgetViewContainerRef,
              };

              this.mapWidgetKeywordComponents.push(addedKeywordComponent);
            }
          }
        }
      }
    }
  }

  /**
   * Add any KeywordComponent record buttons if the CSW record contains the corresponding keywords
   *
   * @param cswRecord the CSW record
   * @param recordButtonsViewContainerRef the ViewContainerRef for the DatasetsRecordComponent
   */
  public addRecordButtonKeywordComponents(cswRecord: CSWRecordModel, recordButtonsViewContainerRef: ViewContainerRef) {
    if (keywordComponents.hasOwnProperty("keywordComponents")) {
      for (const keyword of cswRecord.descriptiveKeywords) {
        const componentsForKeyword: KeywordComponent[] = keywordComponents[
          "keywordComponents"
        ].filter((c) => c.keyword === keyword);
        for (const keywordComponentItem of componentsForKeyword) {
          if (
            keywordComponentItem.keywordComponentType ===
            KeywordComponentType.RecordButton
          ) {
            // Record Buttons
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
              keywordComponentItem.keywordComponent
            );
            const componentRef: ComponentRef<any> = recordButtonsViewContainerRef.createComponent<KeywordComponent>(componentFactory);
            componentRef.instance.cswRecord = cswRecord;
            const addedKeywordComponent: AddedKeywordComponent = {
              cswRecordIds: [cswRecord.id],
              keywordComponent: keywordComponentItem,
              viewContainerRef: recordButtonsViewContainerRef,
            };
            this.recordButtonKeywordComponents.push(addedKeywordComponent);
          }
        }
      }
    }
  }

  /**
   * Remove any keyword components that are associated with the provided CSW
   * record, provided that no other active layer is associated with the
   * same keyword
   *
   * @param cswRecord the CSW record being removed from the map/active layers list
   */
  public removeKeywordComponents(recordId: string) {
    for (const addedComponent of this.mapWidgetKeywordComponents) {
      addedComponent.cswRecordIds = addedComponent.cswRecordIds.filter(
        (r) => r !== recordId
      );
      if (addedComponent.cswRecordIds.length === 0) {
        const index = this.mapWidgetKeywordComponents.indexOf(addedComponent);
        this.mapWidgetViewContainerRef.remove(index);
        this.mapWidgetKeywordComponents = this.mapWidgetKeywordComponents.filter(
          (kc) => kc.keywordComponent !== addedComponent.keywordComponent
        );
      }
    }

    for (let i = this.recordButtonKeywordComponents.length - 1; i >= 0; i--) {
      if (
        this.recordButtonKeywordComponents[i].cswRecordIds.findIndex(
          (r) => r === recordId
        ) !== -1
      ) {
        this.recordButtonKeywordComponents[i].viewContainerRef.clear();
        this.recordButtonKeywordComponents = this.recordButtonKeywordComponents.filter(
          (kc) => kc.cswRecordIds.findIndex((r) => r === recordId) === -1
        );
      }
    }
  }
}
