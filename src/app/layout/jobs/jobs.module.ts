import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';

import { MonacoEditorModule } from 'ngx-monaco-editor';

import { JobsRoutingModule } from './jobs-routing.module';
import { JobsComponent } from './jobs.component';
import { PageHeaderModule } from '../../shared';
import { JobsService } from './jobs.service';
import { NgbDropdownModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DataServicePreview } from './preview/data-service-preview.component';
import { PlainTextPreview } from './preview/plaintext-preview.component';
import { ImagePreview } from './preview/image-preview.component';
import { PreviewDirective } from './preview/preview.directive';
import { TtlPreview } from './preview/ttl-preview.component';
import { LogPreview } from './preview/log-preview.component';
import { OlMapModule } from '../datasets/openlayermap/olmap.module';
import { JobBrowserComponent } from './job-browser.component';
import { JobInputsComponent } from './job-inputs.component';
import { JobStatusModalContent } from './job-status.modal.component';
import { CopyJobInputsModalContent } from './copy-job-inputs.modal.component';
import { AngularSplitModule } from 'angular-split';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/components/common/messageservice';

@NgModule({
    imports: [
        AngularSplitModule,
        CommonModule,
        FormsModule,
        JobsRoutingModule,
        PageHeaderModule,
        ConfirmDialogModule,
        ContextMenuModule,
        TabViewModule,
        TableModule,
        TreeTableModule,
        OlMapModule,
        NgbDropdownModule.forRoot(),
        NgbCollapseModule.forRoot(),
        MonacoEditorModule.forRoot(),
        ToastModule
    ],
    declarations: [
        JobsComponent, JobBrowserComponent, JobInputsComponent, CopyJobInputsModalContent,       
        PreviewDirective, DataServicePreview, ImagePreview,
        PlainTextPreview, TtlPreview, LogPreview, JobStatusModalContent
    ],
    entryComponents: [ DataServicePreview, ImagePreview, PlainTextPreview, TtlPreview, LogPreview, JobStatusModalContent, CopyJobInputsModalContent ],
    providers: [ JobsService, ConfirmationService, MessageService ]
})
export class JobsModule { }
