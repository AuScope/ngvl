export interface User {
  fullName: string;
}

export const ANONYMOUS_USER: User = {
  fullName: 'Anonymous User'
};

export type EntryType = 'Problem' | 'Toolbox' | 'Solution' | 'Application';
export const ENTRY_TYPES: EntryType[] = ['Problem', 'Toolbox', 'Solution', 'Application'];

export type DependencyType = 'TOOLBOX' | 'PYTHON';
export const DEP_TYPES: DependencyType[] = ['TOOLBOX' , 'PYTHON'];

export type VariableType = 'file' | 'integer' | 'string';
export const VAR_TYPES: VariableType[] = ['file' , 'integer' , 'string'];

export interface Dependency {
  type: DependencyType;
  identifier: string;
  version: string;
  repository: string;
}

export interface Variable {
  name: string;
  label: string;
  description: string;
  optional: boolean;
  type: VariableType;
}

export interface Entry {
  id: string;
  entryType: EntryType;
  createdAt: Date;
  name: string;
  description: string;
  url: string;
  icon?: string;
}

export interface Problem extends Entry {
  entryType: 'Problem';
  solutions: Solution[];
}

export interface Solution extends Entry {
  entryType: 'Solution';
  problem: Problem;
  dependencies: Dependency[];
  template: string;
  variables: Variable[];
}

export interface Application extends Entry {
  entryType: 'Application';
}

export interface Problems {
  configuredProblems: Problem[];
}

export interface SolutionQuery {
  problems?: Problem[];
}
