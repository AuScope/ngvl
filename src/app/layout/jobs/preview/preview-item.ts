import { Type } from '@angular/core';


export class PreviewItem {

    type: string;
    component: Type<any>;
    data: any;
    extensions: string[];
    options: any;

    constructor(type: string, component: Type<any>, data: any, extensions: string[], options?: string) {
        this.type = type;
        this.component = component;
        this.data = data;
        this.extensions = extensions;
        if(options) {
            this.options = options;
        }
    }

}