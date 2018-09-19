import { Component,HostListener,IterableDiffers,ViewChild,ElementRef } from "@angular/core";
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

    @ViewChild('textarea') scrollElement: ElementRef;

    constructor(private _iterableDiffers: IterableDiffers) {

       // this.iterableDiffer = this._iterableDiffers.find([]).create(null);
     }

    /*ngAfterViewChecked() {     
      //  if(this.atBottom) {
           // this.el.nativeElement.scrollTop  = this.el.nativeElement.scrollHeight;
           // this.el.nativeElement.scrollTo({left: 0 , top: this.el.nativeElement.scrollHeight, behavior: 'smooth'});
       //   this.textarea.nativeElement.scrollTop =    this.textarea.nativeElement.scrollHeight -   this.textarea.nativeElement.clientHeight;

        }        
    } */
   

   @HostListener('wheel', ['$event'])       
   onWheel($event):void {            
    //if($event.srcElement.scrollHeight - $event.srcElement.scrollTop === $event.srcElement.clientHeight) {        
    if( ($event.srcElement.scrollTop + $event.srcElement.clientHeight) >  $event.srcElement.scrollHeight - 100) {        
        this.atBottom = true;      
    }
    else
        this.atBottom = false;         
        console.log("onWheel bottom "+this.atBottom);
    /*    //$event.preventDefault();
       // $event.srcElement.scrollTop =    $event.srcElement.scrollHeight -    $event.srcElement.clientHeight;
    console.log("onWheel Bottom "+this.atBottom); */
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

  @HostListener('arrow', ['$event'])       
   onScrollll($event):void {  
    console.log("arrow  onScroll !!!");
  };

  @HostListener('window:scroll', [])       
   onwindowScroll($event):void {  
    console.log("scroll window onScroll !!!");
  };

  @HostListener('document:scroll', ['$event'])       
   ondocumentScroll($event):void {  
    console.log("scroll document onScroll !!!");
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

@HostListener('resize', ['$event'])       
onResize($event):void {  
 console.log("onResize onResize !!!");
};

@HostListener('change', ['$event'])       
onChange($event):void {  
 console.log("onChange onChange !!!");
};

/*ngOnChanges(changes: SimpleChanges){    
    if(changes.input){
      console.log('input changed');
    }
  } */

  onScroll(event) {      
   //   if(event.srcElement.scrollHeight - event.srcElement.scrollTop === event.srcElement.clientHeight) {        
    if( (event.srcElement.scrollTop + event.srcElement.clientHeight) >  event.srcElement.scrollHeight - 100) {        
        this.atBottom = true;      
    }
    else
        this.atBottom = false; 
        console.log("onScroll bottom "+this.atBottom);
  }
}