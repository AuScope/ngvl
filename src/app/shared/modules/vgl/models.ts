import { CSWRecordModel, OnlineResourceModel } from "portal-core-ui";

/*
 * User Models
 */
export interface User {
  fullName: string;
  email: string;
  acceptedTermsConditions: number;
  // AWS details
  arnExecution: string;
  arnStorage: string;
  awsKeyName: string;
}

export const ANONYMOUS_USER: User = {
  fullName: 'Anonymous User',
  email: undefined,
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

export type VariableType = 'file' | 'int' | 'double' | 'string' | 'boolean';
export const VAR_TYPES: VariableType[] = ['file' , 'int', 'double' , 'string', 'boolean'];

export type VarBindingType = string | number | boolean;

export interface Dependency {
  type: DependencyType;
  identifier: string;
  version: string;
  repository: string;
}

export interface Variable {
  name: string;
  label: string;
  description?: string;
  optional?: boolean;
  type: VariableType;
  default?: VarBindingType;
  max?: number;
  min?: number;
  step?: number;
  values?: VarBindingType[];
}

export interface FileVariable extends Variable {
  type: 'file';
}

export interface IntegerVariable extends Variable {
  type: 'int';
}

export interface StringVariable extends Variable {
  type: 'string';
}

export interface BooleanVariable extends Variable {
  type: 'boolean';
}

export interface DoubleVariable extends Variable {
  type: 'double';
}

export interface Entry {
  entryType: EntryType;
  created_at: Date;
  author: string;
  name: string;
  description: string;
  url: string;
  icon?: string;
  '@id': string;
  id: string;
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
    // parent: Job;
}

export class JobDownload {
    // id: number;
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
    // CSWRecordModels will contain one or more OnlineResourceModels, this is
    // the one for the Job, selected as the first supported type found
    onlineResource?: OnlineResourceModel;
    // The associated CSW record
    cswRecord?: CSWRecordModel;
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
    computeVmId: string;
    computeInstanceId: null;
    computeInstanceType: string;
    computeInstanceKey: string;
    computeServiceId: string;
    computeTypeId: string;
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
    jobSolutions: string[];
    annotations: string[];

    // These are only required for an HPC job, and won't be populated by VGL
    ncpus?: number;
    jobfs?: number;
    mem?: number;
}

export interface ComputeService {
    id: string;
    name: string;
}

export interface MachineImage {
    // The unique id of the cloud image - will be used for spawning instances of this image
    imageId: string;
    // Descriptive short name of this image
    name: string;
    // Longer description of this image
    description: string;
    // (Possibly empty) List of descriptive keywords for this image
    keywords: string[];
    // The minimum root disk size (in GB) that this image can be run on. Null if this is N/A
    minimumDiskGB: number;
    // The (possibly null) run command that should be used to execute python scripts. If null, most providers will default to 'python'
    runCommand: string;
    // Permissions
    permissions: string[];
    // Annotations for this image, possibly provider specific.
    annotations: string[];
}

export interface ComputeType {
    /** Name of this compute type (valid only at parent compute provider) */
    id: string;
    /** Human readable short description of this compute type */
    description: string;
    /** How many virtual CPU's does this compute type offer */
    vcpus: number;
    /** How much RAM (roughly) in MB does this compute type offer */
    ramMB: number;
    /** How much does the root disk of this compute type offer (in GB) */
    rootDiskGB: number;
    /** How much does the Ephemeral disk of this compute type offer (in GB) */
    ephemeralDiskGB: number;
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
    id: number;         // Not present on root
    name: string;
    expanded: boolean;
    expandable: boolean;
    leaf: boolean;
    root: boolean;      // Not present on children
    seriesId: number;
    children: TreeJobNode[];
    submitDate: Date;   // Only present on job leaves
    status: string;     // Only present on job leaves
}

/*
 * File Preview Model
 */
export interface PreviewComponent {
    data: any;
    options?: any;
    atBottom: boolean;
    scrollElement?: any;
}

/*
 * Dataset options
 */
export interface DownloadOptions {
    name: string;
    description: string;
    url: string;
    method?: string;
    localPath: string;
    crs?: string;
    eastBoundLongitude?: number;
    northBoundLatitude?: number;
    southBoundLatitude?: number;
    westBoundLongitude?: number;
    dsEastBoundLongitude?: number;
    dsNorthBoundLatitude?: number;
    dsSouthBoundLatitude?: number;
    dsWestBoundLongitude?: number;
    format?: string;
    layerName?: string;
    coverageName?: string;
    serviceUrl?: string;
    srsName?: string;
    featureType?: string;
    outputWidth?: number;
    outputHeight?: number;
    id?: number;
    bookmarkId?: number;
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
    checked?: boolean;        // Is registry checked in UI
    startIndex?: number;      // Current start index for search
    prevIndices?: number[];   // Previous start indices for search
    recordsMatched?: number;  // Total number of records matched
    currentPage?: number;     // Current page of search records
    searching?: boolean;      // Is a faceted search in progress?
    searchError?: string;     // Faceted search error result for registry
}

export interface DescribeCoverage {
  description: string;
  name: string;
  label: string;
  supportedRequestCRSs: string[];
  supportedResponseCRSs: string[];
  supportedFormats: string[];
  supportedInterpolations: string[];
  nativeCRSs: string[];
  // May need to define these as interfaces if needed
  spatialDomain: any; //SpatialDomain --- define if needed
  temporalDomain: any[]; //TemporalDomain[] --- define if needed
  rangeSet: any; //RangeSet --- define if needed
}

export function isSolution(x) {
  if (x && x.problem !== undefined) {
    return true;
  }

  return false;
}
