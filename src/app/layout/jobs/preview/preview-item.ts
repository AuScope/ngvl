import { Type } from '@angular/core';


export class PreviewItem {
  constructor(public type: string, public component: Type<any>, public data: any, public extensions: string[]) {}
}