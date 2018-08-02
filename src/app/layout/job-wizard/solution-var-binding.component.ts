import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { VarBinding } from './models';

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

}
