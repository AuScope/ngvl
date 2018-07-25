import { CSWRecordModel } from "portal-core-ui/model/data/cswrecord.model";
import { OnlineResourceModel } from "portal-core-ui/model/data/onlineresource.model";

/*
 * User Models
 */
export interface User {
  fullName: string;  
  acceptedTermsConditions: number;
  // AWS details
  arnExecution: string;
  arnStorage: string;
  awsKeyName: string;
}

export const ANONYMOUS_USER: User = {
  fullName: 'Anonymous User',  
  acceptedTermsConditions: 0,
  arnExecution: undefined,
  arnStorage: undefined,
  awsKeyName: undefined
};

export interface NCIDetails {
    nciUsername: string;
    nciProject: string;
    nciKey: string;
}

/*
 * SSSC Models
 */
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
  created_at: Date;
  author: string;
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

/*
 * Job Models
 */
export interface JobFile {
    name: string;
    size: number;
    directoryFlag: boolean;
    parentPath: string;
}

export class JobParameter {
    id: number;
    name: string;
    value: string;
    type: string;
    //parent: Job;  // XXX needed?
}

export class JobDownload {
    //id: number;
    name: string;
    description: string;
    url: string;
    localPath: string;
    northBoundLatitude: number;
    southBoundLatitude: number;
    eastBoundLongitude: number;
    westBoundLongitude: number;
    parent: Job;
    owner: string;
    parentUrl: string;
    parentName: string;
}

export interface Job {
    id: number;
    name: string;
    description: string;
    emailAddress: string;
    user: string;
    submitDate: Date;
    processDate: Date;
    status: string;
    computeVmI: string;
    computeInstanceId: null,
    computeInstanceType: string;
    computeInstanceKey: string;
    computeServiceId: string;
    storageBaseKey: string;
    storageServiceId: string;
    registeredUrl: string;
    seriesId: number;
    emailNotification: boolean;
    processTimeLog: string;
    storageBucket: string;
    promsReportUrl: string;
    computeVmRunCommand: string;
    walltime: number;
    containsPersistentVolumes: boolean;
    executeDate: Date;
    jobParameters: JobParameter[];
    jobDownloads: JobDownload[];
    jobFiles: JobFile[];
    //jobSolutions: Solution[]; // XXX needed?
}

export interface CloudFileInformation {
    name: string;
    size: number;
    cloudKey: string;
    publicUrl: string;
    fileHash: string;

    jobId: number;
}

export interface Series {
    id: number;
    user: string;
    name: string;
    description: string;
}

/*
 * Job Tree-Table Models
 */
export interface TreeJobs {
    nodes: TreeJobNode;
    jobs: Job[];
}

export interface TreeJobNode {
    id: number,         // Not present on root
    name: string;
    expanded: boolean;
    expandable: boolean;
    leaf: boolean;
    root: boolean;      // Not present on children
    seriesId: number;
    children: TreeJobNode[];
    submitDate: Date,   // Only present on job leaves
    status: string;     // Only present on job leaves
}

/*
 * File Preview Model
 */
export interface PreviewComponent {
    data: any;
}

/*
 * Dataset options
 */
export interface DownloadOptions {
    name: string,
    description: string,
    url: string,
    method?: string,
    localPath: string,
    crs?: string,
    eastBoundLongitude?: number,
    northBoundLatitude?: number,
    southBoundLatitude?: number,
    westBoundLongitude?: number,
    dsEastBoundLongitude?: number,
    dsNorthBoundLatitude?: number,
    dsSouthBoundLatitude?: number,
    dsWestBoundLongitude?: number,
    format?: string,
    layerName?: string,
    coverageName?: string,
    serviceUrl?: string,
    srsName?: string,
    featureType?: string,
    id?: string,
    bookmarkId?: string,
    bookmarkOptionName?: string;
}

/* book marks information for a dataset*/
export interface BookMark {    
    fileIdentifier: string;
    serviceId: string;
    userId?: string;   
    id?: number;
}

/* Registry information used in faceted search and for book marks*/
export interface Registry {
    title: string;
    id: string;
    url: string;
    checked?: boolean;
    startIndex?: number;
    prevIndices?: number[]
}