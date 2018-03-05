export type EntryType = 'Problem' | 'Toolbox' | 'Solution' | 'Application';
export const ENTRY_TYPES: EntryType[] = ['Problem', 'Toolbox', 'Solution', 'Application'];

export class Entry {
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
}

export interface Toolbox extends Entry {
  entryType: 'Toolbox';
}

export interface Solution extends Entry {
  entryType: 'Solution';
}

export interface Application extends Entry {
  entryType: 'Application';
}
