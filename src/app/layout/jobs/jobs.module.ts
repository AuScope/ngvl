import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SliderModule } from 'primeng/slider';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';

import { MonacoEditorModule } from 'ngx-monaco-editor';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

import { JobsRoutingModule } from './jobs-routing.module';
import { JobsComponent } from './jobs.component';
import { PageHeaderModule } from '../../shared';
import { JobsService } from './jobs.service';
import { NgbDropdownModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DataServicePreviewComponent } from './preview/data-service-preview.component';
import { PlainTextPreviewComponent } from './preview/plaintext-preview.component';
import { ImagePreviewComponent } from './preview/image-preview.component';
import { PdfPreviewComponent } from './preview/pdf-preview.component';
import { PreviewDirective } from './preview/preview.directive';
import { TtlPreviewComponent } from './preview/ttl-preview.component';
import { LogPreviewComponent } from './preview/log-preview.component';
import { GeoTiffPreviewComponent } from './preview/geotiff-preview.component';
import { OlMapModule } from '../datasets/openlayermap/olmap.module';
import { JobBrowserComponent } from './job-browser.component';
import { JobInputsComponent } from './job-inputs.component';
import { JobStatusModalComponent} from './job-status.modal.component';
import { CopyJobInputsModalComponent } from './copy-job-inputs.modal.component';
import { AngularSplitModule } from 'angular-split';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@NgModule({
    imports: [
        AngularSplitModule.forRoot(),
        CommonModule,
        FormsModule,
        JobsRoutingModule,
        PageHeaderModule,
        ConfirmDialogModule,
        ContextMenuModule,
        SliderModule,
        TabViewModule,
        TableModule,
        TreeTableModule,
        OlMapModule,
        NgbDropdownModule,
        NgbCollapseModule,
        MonacoEditorModule.forRoot(),
        PdfJsViewerModule,
        ToastModule
    ],
    declarations: [
        JobsComponent, JobBrowserComponent, JobInputsComponent, CopyJobInputsModalComponent,
        PreviewDirective, DataServicePreviewComponent, ImagePreviewComponent, PdfPreviewComponent,
        PlainTextPreviewComponent, TtlPreviewComponent, LogPreviewComponent, GeoTiffPreviewComponent, JobStatusModalComponent
    ],
    entryComponents: [
        DataServicePreviewComponent, ImagePreviewComponent,
        PlainTextPreviewComponent, TtlPreviewComponent, LogPreviewComponent,
        GeoTiffPreviewComponent, JobStatusModalComponent, CopyJobInputsModalComponent,
        PdfPreviewComponent
    ],
    providers: [ JobsService, ConfirmationService, MessageService ]
})
export class JobsModule { }
