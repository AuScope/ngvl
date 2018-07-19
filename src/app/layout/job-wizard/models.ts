import { Solution, VarBindingType, Variable, VariableType } from '../../shared/modules/vgl/models';

export interface SolutionVarBindings {
  solution: Solution;
  bindings: { [varName: string]: VarBindingType }
}

export type VarBindingOptions<T> = {
  value?: T,
  key?: string,
  label?: string,
  description?: string,
  required?: boolean,
  order?: number,
  controlType?: string,
  min?: number,
  max?: number,
  step?: number,
  options?: T[]
};

export class VarBinding<T> {
  value: T;
  key: string;
  label: string;
  description: string;
  required: boolean;
  order: number;
  controlType: string;

  constructor(options: VarBindingOptions<T> = {}) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.description = options.description || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
  }
}

export class TextboxBinding extends VarBinding<string> {
  controlType = 'textbox';
  formType: string;

  constructor(options: {} = {}) {
    super(options);
    this.formType = options['type'] || 'text';
  }
}

export class NumberboxBinding extends VarBinding<number> {
  controlType = 'textbox';
  formType: string;

  constructor(options: {} = {}) {
    super(options);
    this.formType = options['type'] || 'number';
  }
}

type SelectableVarType = string | number;

export class DropdownBinding<T extends string|number> extends VarBinding<T> {
  controlType = 'dropdown';
  options: {key: string, value: T}[] = [];

  constructor(options: {} = {}) {
    super(options);
    this.options = options['options'] || [];
  }
}

export class CheckboxBinding extends VarBinding<boolean> {
  controlType = 'checkbox';
}
