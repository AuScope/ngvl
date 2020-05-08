import { Component, OnDestroy, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Solution, JobDownload, CloudFileInformation } from '../../shared/modules/vgl/models';
import { VarBinding, OptionsBinding } from '../../shared/modules/solutions/models';

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

  private subscription: Subscription;

  constructor(
    private vbs: SolutionVarBindingsService,
    private uss: UserStateService
  ) {}

  ngOnInit() {
    // Create the form for our bindings, and subscribe to values changes so we
    // can update the parent bindings.
    this.form = this.vbs.toFormGroup(this.bindings);
    this.form.valueChanges.pipe(
      map(values => this.formBindings(values))
    ).subscribe(bindings => this.bindingsChange.emit(bindings));

    this.subscription = combineLatest(
      this.uss.jobDownloads,
      this.uss.jobCloudFiles,
      this.uss.uploadedFiles
    ).subscribe(inputs => this.updateInputFiles(inputs));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  formBindings(values): VarBinding<any>[] {
    const bindings = [...this.bindings];

    for (const b of bindings) {
      b.value = values[b.key];
    }

    return bindings;
  }

  updateInputFiles([downs, clouds, ups]: [JobDownload[], CloudFileInformation[], any[]]) {
    const values = [
      ...downs.map(d => ({key: d.localPath, value: d.name})),
      ...clouds.map(c => ({key: c.name, value: c.name})),
      ...ups.map(u => ({key: u.name, value: u.name}))
    ];

    this.bindings.forEach(b => {
      if (this.isInputFileBinding(b)) {
        (b as OptionsBinding<any>).values = values;

        // If the current value is in options then retain it, otherwise reset to no selection
        const stillAnOption = values.find(o => o.key === b.value);
        if (!stillAnOption) {
          b.value = null;
        }
      }
    });
  }

  isInputFileBinding(binding: VarBinding<any>): boolean {
    return binding && binding.type === 'file';
  }
}
