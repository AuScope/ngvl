import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[layerButton]',
})
export class LayerButtonDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
