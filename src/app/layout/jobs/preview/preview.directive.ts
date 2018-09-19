import { Directive, ViewContainerRef,HostListener } from '@angular/core';


@Directive({
    selector: '[preview-host]',
})

export class PreviewDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }

    @HostListener('click', ['$event.target'])
    onClick(btn) {
        console.log('Host Element Clicked');
   }

}