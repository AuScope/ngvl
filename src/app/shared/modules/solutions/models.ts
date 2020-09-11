import { Solution, VarBindingType, Variable } from '../vgl/models';

export interface SolutionVarBindingTypes {
  solution: Solution;
  bindings: { [varName: string]: VarBindingType };
}

export interface VarBindingOptions<T extends VarBindingType> {
  key: string;
  label: string;
  description: string;
  required: boolean;
  type: string;
  value?: T;
  values?: T[];
  min?: number;
  max?: number;
  step?: number;

  order?: number;
}

export class VarBinding<T extends VarBindingType> {
  value: T;
  key: string;
  label: string;
  description: string;
  required: boolean;
  type: string;

  order: number;
  controlType: string;

  constructor(options: VarBindingOptions<T>) {
    this.key = options.key;
    this.label = options.label;
    this.description = options.description;
    this.required = options.required;
    this.type = options.type;

    if (options.value !== undefined) {
      this.value = options.value;
    }
    this.order = options.order === undefined ? 1 : options.order;
  }

  /**
   * Return true if this binding is valid.
   *
   * For a generic binding, we can test that it is either optional, or required
   * but has a defined value. More specific tests for different variable types
   * need to be implemented in subclasses.
   */
  isValid(): boolean {
    // A required variable must have a defined value
    if (this.required) {
      return this.value != null;
    }

    // An optional variable is always valid
    return true;
  }
}

export interface SolutionVarBindings {
    [key: string]: VarBinding<any>[];
}

export class InputBinding<T extends VarBindingType> extends VarBinding<T> {
  controlType = 'input';
}

export class StringEntryBinding extends InputBinding<string> {
  controlType = 'text';

  isValid() {
    // A string value must be non-empty
    if (this.required) {
      return !!this.value;
    }

    return super.isValid();
  }
}

export class NumberEntryBinding extends InputBinding<number> {
  controlType = 'number';
}

export class OptionsBinding<T extends VarBindingType> extends VarBinding<T> {
  controlType = 'dropdown';
  values: T[] = [];

  constructor(options: VarBindingOptions<T>) {
    super(options);
    this.values = options.values ?? [];
  }

  isValid() {
    // Need to check specific types to look for empty strings
    if (this.required && (this.type === 'string' || this.type === 'file')) {
      return !!this.value;
    }

    return super.isValid();
  }
}

export class BooleanBinding extends InputBinding<boolean> {
  controlType = 'checkbox';
}

export function create_var_binding(
  variable: Variable,
  options = {}
): VarBinding<any> {

  const opts: VarBindingOptions<any> = {
    key: variable.name,
    label: variable.label || variable.name,
    description: variable.description ?? '',
    required: !variable.optional,
    type: variable.type,
    value: variable.default,
    ...options
  };

  if (variable.values?.length > 0) {
    opts.values = variable.values;
    return variable.type === 'string' ? new OptionsBinding<string>(opts) : new OptionsBinding<number>(opts);
  } else {
    switch (variable.type) {
      case 'int':
        return new NumberEntryBinding({
          min: variable.min ?? Number.MIN_SAFE_INTEGER,
          max: variable.max ?? Number.MAX_SAFE_INTEGER,
          step: variable.step ?? 1,
          ...opts
        });
      case 'double':
        return new NumberEntryBinding({
          min: variable.min ?? -Number.MAX_VALUE,
          max: variable.max ?? Number.MAX_VALUE,
          step: variable.step ?? Number.NaN,
          ...opts
        });
      case 'boolean':
        return new BooleanBinding(opts);
      case 'file':
        // Input dataset variables are implemented as OptionsBindings
        return new OptionsBinding<string>(opts);
      default:
        return new StringEntryBinding(opts);
    }
  }
}
