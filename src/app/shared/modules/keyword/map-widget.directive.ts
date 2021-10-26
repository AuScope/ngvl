import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[mapWidget]',
})
export class MapWidgetDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
