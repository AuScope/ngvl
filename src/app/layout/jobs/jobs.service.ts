import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { Job, TreeJobs, Series, CloudDirectoryInformation, CloudFileInformation,
         ComputeService, MachineImage, ComputeType } from '../../shared/modules/vgl/models';


@Injectable()
export class JobsService {

    constructor(private vgl: VglService) { }


    public getTreeJobs(): Observable<TreeJobs> {
        return this.vgl.treeJobs;
    }

    public addFolder(newFolder: string): Observable<Series> {
        return this.vgl.addFolder(newFolder);
    }

    public getJobCloudFiles(jobId: number): Observable<CloudFileInformation[]> {
        return this.vgl.getJobCloudFiles(jobId);
    }

    public getJobCloudDirectoriesAndFiles(jobId: number): Observable<CloudDirectoryInformation> {
        return this.vgl.getJobCloudDirectoriesAndFiles(jobId);
    }

    public downloadFile(jobId: number, filename: string, key: string): Observable<any> {
        return this.vgl.downloadFile(jobId, filename, key);
    }

    public downloadFilesAsZip(jobId: number, filenames: string[]): Observable<any> {
        return this.vgl.downloadFilesAsZip(jobId, filenames);
    }

    public getPlaintextPreview(jobId: number, file: string, maxSize: number): Observable<String> {
        return this.vgl.getPlaintextPreview(jobId, file, maxSize);
    }

    public getSectionedLogs(jobId: number): Observable<any> {
        return this.vgl.getSectionedLogs(jobId);
    }

    public deleteJob(jobId: number): Observable<any> {
        return this.vgl.deleteJob(jobId);
    }

    public deleteSeries(seriesId: number): Observable<any> {
        return this.vgl.deleteSeries(seriesId);
    }

    public cancelJob(jobId: number): Observable<any> {
        return this.vgl.cancelJob(jobId);
    }

    public submitJob(job: Job): Observable<any> {
        return this.vgl.submitJob(job);
    }

    public duplicateJob(jobId: number): Observable<Job[]> {
        return this.vgl.duplicateJob(jobId);
    }

    public getAuditLogs(jobId: number): Observable<any> {
        return this.vgl.getAuditLogs(jobId);
    }

    public getComputeServices(): Observable<ComputeService[]> {
        return this.vgl.getComputeServices();
    }

    public getMachineImages(computeServiceId: string): Observable<MachineImage[]> {
        return this.vgl.getMachineImages(computeServiceId);
    }

    public getComputeTypes(computeServiceId: string, machineImageId: string): Observable<ComputeType[]> {
        return this.vgl.getComputeTypes(computeServiceId, machineImageId);
    }

    public setJobFolder(jobId: number[], seriesId: number): Observable<any> {
        return this.vgl.setJobFolder(jobId, seriesId);
    }

    public getJobStatuses(): Observable<any> {
        return this.vgl.getJobStatuses();
    }

}
