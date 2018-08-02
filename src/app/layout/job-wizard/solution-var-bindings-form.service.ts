import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { VarBinding } from './models';

@Injectable()
export class SolutionVarBindingsFormService {

  constructor() {}

  toFormGroup(bindings: VarBinding<any>[]) {
    let group: any = {};

    bindings.forEach(binding => {
      group[binding.key] = binding.required
        ? new FormControl(binding.value || '', Validators.required)
        : new FormControl(binding.value || '');
    });

    return new FormGroup(group);
  }
}
