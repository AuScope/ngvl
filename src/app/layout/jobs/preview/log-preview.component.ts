import { Component,HostListener,Inject } from "@angular/core";
import { PreviewComponent } from '../../../shared/modules/vgl/models';
import { DOCUMENT } from "@angular/platform-browser";



@Component({
    selector: 'app-log-preview',
    templateUrl: 'log-preview.component.html',
    styleUrls: ['log-preview.component.scss']
})


/**
 * TODO: Add sectioned log tab view similar to VGL
 */
export class LogPreview implements PreviewComponent {

    // Data will be the plaintext string
    data: any;

    // Expose log keys to template
    logKeys = Object.keys;

    atBottom: boolean = false;

    constructor(@Inject(DOCUMENT) private document: Document) { }

    ngAfterViewChecked() {     
        if(this.atBottom) {
           // this.el.nativeElement.scrollTop  = this.el.nativeElement.scrollHeight;
           // this.el.nativeElement.scrollTo({left: 0 , top: this.el.nativeElement.scrollHeight, behavior: 'smooth'});
           document.documentElement.scrollTop = document.documentElement.scrollHeight;
           document.documentElement.scrollIntoView();
        }        
    }
   

   @HostListener('wheel', ['$event'])       
   onWheel($event):void {        
    if($event.srcElement.scrollHeight - $event.srcElement.scrollTop === $event.srcElement.clientHeight) {        
        this.atBottom = true;
        event.preventDefault();
    }
    else
        this.atBottom = false;
        
    console.log("onWheel Bottom "+this.atBottom);
  };  


  @HostListener('window:load', ['$event'])       
   onWindowLoad($event):void {  
    console.log("window onLoad !!!");
  };  

  @HostListener('document:load', ['$event'])       
   onDocumentLoad($event):void {  
    console.log("document onLoad !!!");
  };

  @HostListener('load', ['$event'])       
   onLoad($event):void {  
    console.log("load onLoad !!!");
  };

  @HostListener('focus', ['$event'])       
   onFocus($event):void {  
    console.log("focus onFocus !!!");
  };

  @HostListener('scroll', ['$event'])       
   onScroll($event):void {  
    console.log("scroll onScroll !!!");
  };

  @HostListener('loadend', ['$event'])       
  onLoadEnd($event):void {  
   console.log("loadend onLoadEnd !!!");
 };

 @HostListener('broadcast', ['$event'])       
 onBroadcast($event):void {  
  console.log("onBroadcast onBroadcast !!!");
};

@HostListener('valueChange', ['$event'])       
onValueChange($event):void {  
 console.log("onValueChange onValueChange !!!");
};

@HostListener('waiting', ['$event'])       
onWaiting($event):void {  
 console.log("onWaiting onWaiting !!!");
};
}