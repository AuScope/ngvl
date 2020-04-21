import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { VarBinding, StringEntryBinding, NumberEntryBinding, OptionsBinding } from '../../shared/modules/solutions/models';

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

getBindingOptions<T>(binding: VarBinding<T>): {key: string, value: T}[] {
  if (binding instanceof OptionsBinding) {
    return binding.options;
  }

  return [];
}

}
