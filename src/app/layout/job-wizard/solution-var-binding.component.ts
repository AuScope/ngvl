import { Component, Injectable, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { VarBinding, NumberEntryBinding, OptionsBinding } from '../../shared/modules/solutions/models';
import { VarBindingType } from '../../shared/modules/vgl/models';
import { UserStateService } from '../../shared';

/**
 * Convert between ISO8601 string and the NgbDateStruct representations of a 
 * date for transferring between the NgbDatepicker and the VGL models.
 */
 @Injectable()
 export class CustomAdapter extends NgbDateAdapter<string> {
 
   readonly DELIMITER = '-';
 
   fromModel(value: string | null): NgbDateStruct | null {
     if (value) {
       let date = value.split(this.DELIMITER);
       return {
         day : parseInt(date[2], 10),
         month : parseInt(date[1], 10),
         year : parseInt(date[0], 10)
       };
     }
     return null;
   }
 
   toModel(date: NgbDateStruct | null): string | null {
     return date ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day : null;
   }
 }

@Component({
  selector: 'app-solution-var-binding',
  templateUrl: './solution-var-binding.component.html',
  styleUrls: ['./solution-var-binding.component.scss'],
  providers: [{provide: NgbDateAdapter, useClass: CustomAdapter}]
})
export class SolutionVarBindingComponent implements OnInit {

  @Input() binding: VarBinding<any>;
  @Input() form: FormGroup;

  constructor(private userStateService: UserStateService) {}

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

  updateBinding<T extends VarBindingType>(binding: VarBinding<T>, value: T) {
    this.form.patchValue({[binding.key]: value});
  }

}
