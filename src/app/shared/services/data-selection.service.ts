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

    public removeJobFile(jobFile: JobFile): void {
        let jobFiles: JobFile[] = this.getJobFiles();
        for(let i = 0; i < this.getJobFiles().length; i++) {
            if(JSON.stringify(this.getJobFiles()[i]) === JSON.stringify(jobFile)) {
                jobFiles.splice(i, 1);
                this.setJobFiles(jobFiles);
                break;
            }
        }
    }

    // Note the difference between uploaded (JobFile) and copied (CloudFileInformation) files
    public getCopiedJobFiles(): CloudFileInformation[] {
        const localStorageCopiedFiles = JSON.parse(localStorage.getItem('copiedJobFiles'));
        return localStorageCopiedFiles && localStorageCopiedFiles.hasOwnProperty('copiedJobFiles') ? localStorageCopiedFiles.copiedJobFiles : [];
    }

    public setCopiedJobFiles(copiedJobFiles: CloudFileInformation[], copiedJobId: number): void {
        localStorage.setItem('copiedJobFiles', JSON.stringify({ copiedJobId: copiedJobId, copiedJobFiles: copiedJobFiles }));
    }

    public removeCopiedJobFile(copiedJobFile: CloudFileInformation): void {
        const localStorageCopiedFiles = JSON.parse(localStorage.getItem('copiedJobFiles'));
        const jobId = localStorageCopiedFiles && localStorageCopiedFiles.hasOwnProperty('copiedJobFiles') ? localStorageCopiedFiles.copiedJobId : -1;
        if(jobId != -1) {
            let copiedJobFiles: CloudFileInformation[] = localStorageCopiedFiles.copiedJobFiles;
            for(let i = 0; i < this.getCopiedJobFiles().length; i++) {
                if(JSON.stringify(this.getCopiedJobFiles()[i]) === JSON.stringify(copiedJobFile)) {
                    copiedJobFiles.splice(i, 1);
                    this.setCopiedJobFiles(copiedJobFiles, jobId);
                    break;
                }
            }
        }
    }

}