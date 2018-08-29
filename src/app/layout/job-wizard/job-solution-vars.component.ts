import { Component, OnDestroy, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subscription, combineLatest } from 'rxjs';

import { Solution, JobDownload, CloudFileInformation } from '../../shared/modules/vgl/models';

import { SolutionVarBindings, VarBinding, DropdownBinding } from './models';
import { SolutionVarBindingsService } from './solution-var-bindings.service';

import { UserStateService } from '../../shared';

@Component({
  selector: 'app-job-solution-vars',
  templateUrl: './job-solution-vars.component.html',
  styleUrls: ['./job-solution-vars.component.scss']
})
export class JobSolutionVarsComponent implements OnDestroy, OnInit {

  @Input() solution: Solution;
  @Input() bindings: VarBinding<any>[] = [];
  @Output() bindingsChange = new EventEmitter<VarBinding<any>[]>();

  form: FormGroup;
  payLoad = '';

  private subscription: Subscription;

  constructor(
    private vbs: SolutionVarBindingsService,
    private uss: UserStateService
  ) {}

  ngOnInit() {
    this.form = this.vbs.toFormGroup(this.bindings);

    this.subscription = combineLatest(
      this.uss.jobDownloads,
      this.uss.jobCloudFiles,
      this.uss.uploadedFiles
    ).subscribe(inputs => this.updateInputFiles(inputs));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSubmit() {
    this.bindingsChange.emit(this.formBindings());
  }

  formBindings(): VarBinding<any>[] {
    const bindings = [...this.bindings];

    for (const b of bindings) {
      b.value = this.form.value[b.key];
    }

    return bindings;
  }

  updateInputFiles([downs, clouds, ups]: [JobDownload[], CloudFileInformation[], any[]]) {
    const options = [
      ...downs.map(d => { return {key: d.name, value: d.name}; }),
      ...clouds.map(c => { return {key: c.name, value: c.name}; }),
      ...ups.map(u => { return {key: u.name, value: u.name}; })
    ];

    this.bindings.forEach(b => {
      if (this.isInputFileBinding(b)) {
        (b as DropdownBinding<any>).options = options;

        // If the current value is in options then retain it, otherwise reset to no selection
        const stillAnOption = options.find(o => o.key == b.value);
        if (!stillAnOption) {
          b.value = null;
        }
      }
    });
  }

  isInputFileBinding(binding: VarBinding<any>): boolean {
    return binding && binding.controlType == 'dropdown';
  }
}
