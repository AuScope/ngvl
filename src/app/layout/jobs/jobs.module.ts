import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

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
    NgbDropdownModule.forRoot(),
    NgbCollapseModule.forRoot()
  ],
  declarations: [ JobsComponent, PreviewDirective, DataServicePreview, ImagePreview, PlainTextPreview, TtlPreview ],
  entryComponents: [ DataServicePreview, ImagePreview, PlainTextPreview, TtlPreview ],
  providers: [ JobsService, ConfirmationService ]
})
export class JobsModule { }
