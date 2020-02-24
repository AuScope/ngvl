import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ng2-validation'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { ToastModule } from 'primeng/toast';

import { JobWizardRoutingModule } from './job-wizard-routing.module';
import { JobWizardComponent } from './job-wizard.component';

import { JobsModule } from '../jobs/jobs.module';
import { SolutionsModule } from '../../shared/modules';
import { JobSolutionsSummaryComponent, FinalTemplateModalComponent } from './job-solutions-summary.component';
import { JobSolutionVarsComponent } from './job-solution-vars.component';
import { SolutionVarBindingComponent } from './solution-var-binding.component';
import { SolutionVarBindingsService } from './solution-var-bindings.service';
import { JobObjectComponent } from './job-object.component';
import { JobDatasetsComponent } from './job-datasets.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CustomFormsModule,
    ReactiveFormsModule,
    NgbModule,
    MonacoEditorModule.forRoot(),
    ContextMenuModule,
    TableModule,
    TreeTableModule,
    ToastModule,
    JobWizardRoutingModule,
    JobsModule,
    SolutionsModule
  ],
  declarations: [
    JobWizardComponent,
    JobDatasetsComponent,
    JobSolutionsSummaryComponent,
    JobSolutionVarsComponent,
    JobObjectComponent,
    FinalTemplateModalComponent,
    SolutionVarBindingComponent
  ],
  exports: [JobWizardComponent],
  providers: [SolutionVarBindingsService],
  entryComponents: [FinalTemplateModalComponent]
})
export class JobWizardModule { }
