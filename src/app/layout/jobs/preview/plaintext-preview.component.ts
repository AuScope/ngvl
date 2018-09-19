import { Component,HostListener,ViewChild, ElementRef } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';


@Component({
    selector: 'app-plaintext-preview',
    templateUrl: 'plaintext-preview.component.html',
    styleUrls: []
})


export class PlainTextPreview implements PreviewComponent {

    // Data will be the plaintext string
    data: any;
    options: any = {
        theme: 'vs-light'
    };
    atBottom: boolean = false;

    @ViewChild('scrollarea') scrollElement: ElementRef;

    constructor() { }

    /**
     * Language will most often be the same as the extension, check for the
     * few instances where it is not
     * 
     * @param extension file name extension
     */
    public static selectLanguageByExtension(extension: string): string {
        let language = extension;
        switch(extension.toLocaleLowerCase()) {
            case 'py':
                language = 'python';
            break;
            case 'js':
                language = 'javascript';
            break;
            case 'ts':
                language = 'typescript';
            break;
        }
        return language;
    }

    @HostListener('wheel', ['$event'])
    onWheel($event): void {
        if (($event.srcElement.scrollTop + $event.srcElement.clientHeight) > $event.srcElement.scrollHeight - 100) {
            this.atBottom = true;
        }
        else
            this.atBottom = false;
    };

    onScroll(event) {
        if ((event.srcElement.scrollTop + event.srcElement.clientHeight) > event.srcElement.scrollHeight - 100) {
            this.atBottom = true;
        }
        else
            this.atBottom = false;
    }
}