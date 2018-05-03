import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ViewChild } from '@angular/core';
import { UserStateService, ViewType } from '../../../shared';
import { OverlayPanel } from 'primeng/overlaypanel';



@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})


export class SidebarComponent implements OnInit {

    // Emit sidebar expansion/contraction event on change
    @Output() sidebarExpansionEvent = new EventEmitter<boolean>();

    private currentView: ViewType;

    isActive: boolean = false;
    showMenu: string = '';

    // Sidebar expansion passed from parent layout component
    @Input() isSidebarExpanded: boolean;


    constructor(private userStateService: UserStateService) {
    }


    /**
     * Set the sidebar style based on whether it is expanded or not
     */
    public setSidebarStyle(): any {
        let styles= {
            'left': this.isSidebarExpanded ? '280px' : '60px',
            'width': this.isSidebarExpanded ? '280px' : '60px',
            'margin-left': this.isSidebarExpanded ? '-280px' : '-60px'
        }
        return styles;
    }
    

    /**
     * Set whether the sidebar should be expanded or not
     * 
     * @param expanded true if sidebar expanded, false if not
     */
    public setExpanded(expanded: boolean): void {
        this.sidebarExpansionEvent.emit(expanded);
    }



    ngOnInit(): void {
        // Listen for the current user view, and display the appropriate
        // view-specific components.
        this.userStateService.currentView
            .subscribe(viewType => this.showComponentForView(viewType));
    }


    showComponentForView(viewType: ViewType) {
        this.currentView = viewType;
    }


    getCurrentView(): string {
        return this.currentView;
    }


    eventCalled() {
        this.isActive = !this.isActive;
    }

    
    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

}


// /**
//   * Retrieve csw records from the service and organize them by group
//   * @returns a observable object that returns the list of csw record organized in groups
//   */
//  public getLayerRecord(): Observable<any> {
//    const me = this;
//    if (this.layerRecord.length > 0) {
//        return Observable.of(this.layerRecord);
//    } else {
//      return this.http.get(this.env.portalBaseUrl + this.env.getCSWRecordUrl)
//        .map(response => {
//            const cswRecord = response['data'];
//            cswRecord.forEach(function(item, i, ar) {
//              if (me.layerRecord[item.group] === undefined) {
//                me.layerRecord[item.group] = [];
//              }
//              // VT: attempted to cast the object into a typescript class however it doesn't seem like its possible
//              // all examples points to casting from json to interface but not object to interface.
//              item.expanded = false;
//              item.hide = false;
//              me.layerRecord[item.group].push(item);
//            });
//            return me.layerRecord;
//        });
//    }
//  }
