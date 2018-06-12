import { Injectable } from "@angular/core";
import { JobDownload, JobFile, CloudFileInformation } from '../modules/vgl/models';


/**
 * User dataset selection service, stores User selection in local storage.
 * Selections will be persisted to the server when a Job is created.
 * 
 * Stored user inputs include:
 * 
 * 1. JobDownloads: dataset selections made on map screen (jobDownloads), as
 *    well as datasets copied from existing jobs (copiedJobDownloads).
 * 
 * 2. Copied CloudFileInformation from existing jobs (cloudJobFiles)
 * 
 * TODO: Copied job info should probably be moved to User State Service,
 *       irrelevant to anonymous users and security issues..?
 */
@Injectable()
export class DataSelectionService {

    constructor() { }

    /**
     * JobDownloads (from dataset selection and copied from existing jobs)
     */
    public getJobDownloads(): JobDownload[] {
        const localStorageDownloads = JSON.parse(localStorage.getItem('jobDownloads'));
        return localStorageDownloads && localStorageDownloads.hasOwnProperty('jobDownloads') ? localStorageDownloads.jobDownloads : [];
    }

    public setJobDownloads(datasetDownloads: JobDownload[]): void {
        localStorage.setItem('jobDownloads', JSON.stringify({ jobDownloads: datasetDownloads }));
    }

    public removeJobDownload(jobDownload: JobDownload): void {
        let jobDownloads: JobDownload[] = this.getJobDownloads();
        for(let i = 0; i < this.getJobDownloads().length; i++) {
            if(JSON.stringify(this.getJobDownloads()[i]) === JSON.stringify(jobDownload)) {
                jobDownloads.splice(i, 1);
                this.setJobDownloads(jobDownloads);
                break;
            }
        }
    }

    public getCopiedJobDownloads(): JobDownload[] {
        const localStorageCopiedDownloads = JSON.parse(localStorage.getItem('copiedJobDownloads'));
        if(localStorageCopiedDownloads && localStorageCopiedDownloads.hasOwnProperty('copiedJobDownloads')) {
            let jobDls: JobDownload[] = localStorageCopiedDownloads.copiedJobDownloads;
        }
        return localStorageCopiedDownloads && localStorageCopiedDownloads.hasOwnProperty('copiedJobDownloads') ? localStorageCopiedDownloads.copiedJobDownloads : [];
    }

    // TODO: As is this will only ever have inputs from one job, may want more
    // Note: we should be able to use JobDownload.id, but current implementation consistent with JobFile
    public setCopiedJobDownloads(copiedJobDownloads: JobDownload[], copiedJobId: number): void {
        localStorage.setItem('copiedJobDownloads', JSON.stringify({ copiedJobId: copiedJobId, copiedJobDownloads: copiedJobDownloads }));
    }

    public removeCopiedJobDownload(copiedJobDownload: JobDownload): void {
        const localStorageJobDownloads = JSON.parse(localStorage.getItem('copiedJobDownloads'));
        const jobId = localStorageJobDownloads && localStorageJobDownloads.hasOwnProperty('copiedJobDownloads') ? localStorageJobDownloads.copiedJobId : -1;
        if(jobId != -1) {
            let copiedJobDownloads: JobDownload[] = localStorageJobDownloads.copiedJobDownloads;
            for(let i = 0; i < this.getCopiedJobDownloads().length; i++) {
                if(JSON.stringify(this.getCopiedJobDownloads()[i]) === JSON.stringify(copiedJobDownload)) {
                    copiedJobDownloads.splice(i, 1);
                    this.setCopiedJobDownloads(copiedJobDownloads, jobId);
                    break;
                }
            }
        }
    }

    // Copied Job files (CloudFileInformation)
    public getJobCloudFiles(): CloudFileInformation[] {
        const localStorageCopiedFiles = JSON.parse(localStorage.getItem('copiedJobFiles'));
        return localStorageCopiedFiles && localStorageCopiedFiles.hasOwnProperty('copiedJobFiles') ? localStorageCopiedFiles.copiedJobFiles : [];
    }

    public setJobCloudFiles(copiedJobFiles: CloudFileInformation[], copiedJobId: number): void {
        localStorage.setItem('copiedJobFiles', JSON.stringify({ copiedJobId: copiedJobId, copiedJobFiles: copiedJobFiles }));
    }

    public removeJobCloudFile(copiedJobFile: CloudFileInformation): void {
        const localStorageCopiedFiles = JSON.parse(localStorage.getItem('copiedJobFiles'));
        const jobId = localStorageCopiedFiles && localStorageCopiedFiles.hasOwnProperty('copiedJobFiles') ? localStorageCopiedFiles.copiedJobId : -1;
        if(jobId != -1) {
            let cloudJobFiles: CloudFileInformation[] = localStorageCopiedFiles.copiedJobFiles;
            for(let i = 0; i < this.getJobCloudFiles().length; i++) {
                if(JSON.stringify(this.getJobCloudFiles()[i]) === JSON.stringify(copiedJobFile)) {
                    cloudJobFiles.splice(i, 1);
                    this.setJobCloudFiles(cloudJobFiles, jobId);
                    break;
                }
            }
        }
    }

}