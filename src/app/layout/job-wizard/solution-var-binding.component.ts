import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { VarBinding, NumberEntryBinding, OptionsBinding } from '../../shared/modules/solutions/models';
import { VarBindingType } from '../../shared/modules/vgl/models';

@Component({
  selector: 'app-solution-var-binding',
  templateUrl: './solution-var-binding.component.html',
  styleUrls: ['./solution-var-binding.component.scss']
})
export class SolutionVarBindingComponent implements OnInit {

  @Input() binding: VarBinding<any>;
  @Input() form: FormGroup;

  constructor() { }

  ngOnInit() {
  }

  get isValid() { return this.form.controls[this.binding.key].valid; }

  inputBindingFormType(binding: VarBinding<any>): string {
    if (binding instanceof NumberEntryBinding) {
      return "number";
    }

    return "string";
  }

  getBindingOptions<T extends VarBindingType>(binding: VarBinding<T>): T[] {
    if (binding instanceof OptionsBinding) {
      const b = binding as OptionsBinding<T>;
      return b.values;
    }

    return [];
  }

  numberBinding<T extends VarBindingType>(binding: VarBinding<T>, property: string): number {
    if (binding instanceof NumberEntryBinding) {
      const b = binding as NumberEntryBinding;
      return b[property];
    }

    return null;
  }

}
