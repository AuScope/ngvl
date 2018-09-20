import { Directive, ViewContainerRef } from '@angular/core';


@Directive({
    selector: '[preview-host]',
})

export class PreviewDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}