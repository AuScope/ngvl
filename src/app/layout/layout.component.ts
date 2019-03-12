import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

    // Will affect both sidebar and main contiainer widths
    isSidebarExpanded: boolean = true;


    constructor() { }


    ngOnInit() { }


    /**
     * Set the style for the main container depending on whether the sidebar is
     * expanded
     */
    public setMainContainerStyle(): any {
        let styles = {
            'margin-left': this.isSidebarExpanded ? '280px' : '60px',
            'margin-right': '12px'
        };
        return styles;
    }


    /**
     * Catch the sidebar expansion/contraction event fired in the sidebar
     * component
     *
     * @param event will be true or false depending on whether the sidebar is
     * expanded (true) or contracted (false)
     */
    public setSidebarExpanded(event) {
        this.isSidebarExpanded = event;
    }
}
