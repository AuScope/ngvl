import { Injectable } from "@angular/core";
import { JobDownload, JobFile, CloudFileInformation } from '../modules/vgl/models';


/**
 * TODO: Copied job info should probably be moved to User State Service,
 *       irrelevant to anonymous users and security issues..?
 * TODO: Can reduce number of methods, store copied/non-copied similarly
 *       and pass copied ID if needed or -1 if not
 */
@Injectable()
export class DataSelectionService {

    constructor() { }

    /**
     * JobDownloads (from dataset selection and copied from exiting jobs)
     */
    public getJobDownloads(): JobDownload[] {
        const localStorageDownloads = JSON.parse(localStorage.getItem('jobDownloads'));
        return localStorageDownloads && localStorageDownloads.hasOwnProperty('jobDownloads') ? localStorageDownloads.jobDownloads : [];
    }

    public setJobDownloads(datasetDownloads: JobDownload[]): void {
        localStorage.setItem('jobDownloads', JSON.stringify({ jobDownloads: datasetDownloads }));
    }

    public getCopiedJobDownloads(): JobDownload[] {
        const localStorageCopiedDownloads = JSON.parse(localStorage.getItem('copiedJobDownloads'));
        if(localStorageCopiedDownloads && localStorageCopiedDownloads.hasOwnProperty('copiedJobDownloads')) {
            let jobDls: JobDownload[] = localStorageCopiedDownloads.copiedJobDownloads;
        }
        return localStorageCopiedDownloads && localStorageCopiedDownloads.hasOwnProperty('copiedJobDownloads') ? localStorageCopiedDownloads.copiedJobDownloads : [];
    }

    // TODO: As is this will only ever have inputs from one job
    // Note: we should be able to use JobDownload.id, but current implementation consistent with JobFile
    public setCopiedJobDownloads(copiedJobDownloads: JobDownload[], copiedJobId: number): void {
        localStorage.setItem('copiedJobDownloads', JSON.stringify({ copiedJobId: copiedJobId, copiedJobDownloads: copiedJobDownloads }));
    }

    /**
     * JobFiles (from dataset confirmation screen and copied from exiting jobs)
     */
    public getJobFiles(): JobFile[] {
        const localStorageFiles = JSON.parse(localStorage.getItem('jobFiles'));
        return localStorageFiles && localStorageFiles.hasOwnProperty('jobFiles') ? localStorageFiles.jobFiles : [];
    }

    public setJobFiles(jobFiles: JobFile[]): void {
        localStorage.setItem('jobFiles', JSON.stringify({ jobFiles: jobFiles }));
    }

    public getCopiedJobFiles(): any[] {
        const localStorageCopiedFiles = JSON.parse(localStorage.getItem('copiedJobFiles'));
        return localStorageCopiedFiles && localStorageCopiedFiles.hasOwnProperty('copiedJobFiles') ? localStorageCopiedFiles.copiedJobFiles : [];
    }

    // Note the difference between uploaded (JobFile) and copied (CloudFileInformation) files
    public setCopiedJobFiles(copiedJobFiles: CloudFileInformation[], copiedJobId: number): void {
        localStorage.setItem('copiedJobFiles', JSON.stringify({ copiedJobId: copiedJobId, copiedJobFiles: copiedJobFiles }));
    }

}