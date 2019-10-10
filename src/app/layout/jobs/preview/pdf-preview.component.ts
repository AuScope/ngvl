import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {
  }

  @Input()
  set data(data: string) {
    this._data = data;
    this.downloadPdf();
  }

  get data(): string { return this._data; }

  downloadPdf() {
    const url = this._data;

    if (url) {
      return this.http.get(url, { responseType: 'blob' }).subscribe((res) => {
        this.inlineViewer.pdfSrc = res;
        this.inlineViewer.refresh();
      });
    }
  }

  onScroll(event) {
    let target = event.target || event.srcElement;
    if ((target.scrollHeight - target.scrollTop) === target.clientHeight) {
      this.atBottom = true;
    } else {
      this.atBottom = false;
    }
  }
}
