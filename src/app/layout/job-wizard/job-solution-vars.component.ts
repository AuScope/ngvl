import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Solution } from '../../shared/modules/vgl/models';

import { SolutionVarBindings, VarBinding } from './models';
import { SolutionVarBindingsFormService } from './solution-var-bindings-form.service';

@Component({
  selector: 'app-job-solution-vars',
  templateUrl: './job-solution-vars.component.html',
  styleUrls: ['./job-solution-vars.component.scss']
})
export class JobSolutionVarsComponent implements OnInit {

  @Input() solution: Solution;
  @Input() bindings: VarBinding<any>[] = [];
  @Output() bindingsChange = new EventEmitter<VarBinding<any>[]>();

  form: FormGroup;
  payLoad = '';

  constructor(private vbs: SolutionVarBindingsFormService) {}

  ngOnInit() {
    this.form = this.vbs.toFormGroup(this.bindings);
  }

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.value);
  }

}
