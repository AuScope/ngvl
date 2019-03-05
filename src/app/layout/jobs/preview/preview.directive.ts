import { Directive, ViewContainerRef } from '@angular/core';


@Directive({
    selector: '[appPreviewHost]'
})

export class PreviewDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}
