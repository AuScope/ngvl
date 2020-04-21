import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatasetsRecordComponent } from './datasets-record.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SliderModule } from 'primeng/slider';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    SliderModule
  ],
  declarations: [ DatasetsRecordComponent ],
  //bootstrap: [ DatasetsRecordComponent ],
  exports: [ DatasetsRecordComponent ]
})
export class DatasetsRecordModule { }
