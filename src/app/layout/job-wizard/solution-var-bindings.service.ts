import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { BehaviorSubject, Observable } from 'rxjs';

import { Solution, isSolution } from '../../shared/modules/vgl/models';
import { SolutionVarBindings, VarBinding } from './models';

@Injectable()
export class SolutionVarBindingsService {

  private _templateBindings: BehaviorSubject<SolutionVarBindings> = new BehaviorSubject({});
  public readonly templateBindings: Observable<SolutionVarBindings> = this._templateBindings.asObservable();

  constructor() {}

  updateTemplateBindings(solution: Solution, bindings: VarBinding<any>[]);
  updateTemplateBindings(varBindings: SolutionVarBindings);
  updateTemplateBindings(s, bindings?) {
    if (isSolution(s)) {
      const solution = s;
      // Copy the current value rather than modifying the stored value.
      const newBindings = {...this._templateBindings.getValue()};
      newBindings[solution['@id']] = bindings;
      this._templateBindings.next(newBindings);
    }
    else {
      // Replace the current set of bindings
      this._templateBindings.next(s);
    }
  }

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
