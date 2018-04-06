import { Type } from '@angular/core';


export class PreviewItem {
  constructor(public component: Type<any>, public data: any, public extensions: string[]) {}
}