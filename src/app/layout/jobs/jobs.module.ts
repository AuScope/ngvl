import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';

import { JobsRoutingModule } from './jobs-routing.module';
import { JobsComponent } from './jobs.component';
import { JobSubmissionDatasetsComponent } from './submission/job-submission-datasets.component';
import { PageHeaderModule } from '../../shared';
import { JobsService } from './jobs.service';
import { NgbDropdownModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DataServicePreview } from './preview/data-service-preview.component';
import { PlainTextPreview } from './preview/plaintext-preview.component';
import { ImagePreview } from './preview/image-preview.component';
import { PreviewDirective } from './preview/preview.directive';
import { TtlPreview } from './preview/ttl-preview.component';
import { OlMapModule } from '../datasets/openlayermap/olmap.module';
import { JobBrowserComponent } from './job-browser.component';
import { JobInputsComponent } from './job-inputs.component';
import { JobStatusModalContent } from './job-status.modal.component';
import { JobInputsBrowserModalContent } from './submission/job-inputs-browser.modal.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        JobsRoutingModule,
        PageHeaderModule,
        ConfirmDialogModule,
        ContextMenuModule,
        TableModule,
        TreeTableModule,
        OlMapModule,
        NgbDropdownModule.forRoot(),
        NgbCollapseModule.forRoot()
    ],
    declarations: [
        JobsComponent, JobBrowserComponent, JobInputsComponent,
        JobSubmissionDatasetsComponent, JobInputsBrowserModalContent,
        PreviewDirective, DataServicePreview, ImagePreview,
        PlainTextPreview, TtlPreview, JobStatusModalContent
    ],
    entryComponents: [ DataServicePreview, ImagePreview, PlainTextPreview, TtlPreview, JobStatusModalContent, JobInputsBrowserModalContent ],
    providers: [ JobsService, ConfirmationService ],
    exports: [ JobSubmissionDatasetsComponent ]
})
export class JobsModule { }
