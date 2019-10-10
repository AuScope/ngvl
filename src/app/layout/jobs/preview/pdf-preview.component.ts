import { Component, ViewChild, ElementRef, Input } from "@angular/core";

import { PreviewComponent } from '../../../shared/modules/vgl/models';


@Component({
  selector: 'app-pdf-preview',
  templateUrl: 'pdf-preview.component.html',
  styleUrls: ['pdf-preview.component.scss']
})


export class PdfPreviewComponent implements PreviewComponent {

  // Data will be a URL to the server's getPdfPreview endpoint
  private _data: string;

  atBottom: boolean = false;

  @ViewChild('pdfInline') inlineViewer;

  constructor() {}

  @Input()
  set data(data: string) {
    this._data = encodeURIComponent(data);
  }

  get data(): string { return this._data; }

  onScroll(event) {
    let target = event.target || event.srcElement;
    if ((target.scrollHeight - target.scrollTop) === target.clientHeight) {
      this.atBottom = true;
    } else {
      this.atBottom = false;
    }
  }
}
