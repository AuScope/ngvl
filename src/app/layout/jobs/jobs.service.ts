import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { TreeJobs, Series, CloudFileInformation } from '../../shared/modules/vgl/models';


@Injectable()
export class JobsService {

  constructor(private vgl: VglService) {}


  public getTreeJobs(): Observable<TreeJobs> {
    return this.vgl.treeJobs;
  }

  public addFolder(newFolder: string): Observable<Series> {
      return this.vgl.addFolder(newFolder);
  }

  public getJobCloudFiles(jobId: number): Observable<CloudFileInformation[]> {
      return this.vgl.getJobCloudFiles(jobId);
  }

  public downloadFile(jobId: number, filename: string, key: string): Observable<any> {
    return this.vgl.downloadFile(jobId, filename, key);
  }

  public downloadFilesAsZip(jobId: number, filenames: string[]): Observable<any> {
    return this.vgl.downloadFilesAsZip(jobId, filenames);
  }

}
