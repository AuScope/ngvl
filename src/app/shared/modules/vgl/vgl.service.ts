import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { Problem, Problems, User, TreeJobs, Series, CloudFileInformation } from './models';

import { environment } from '../../../../environments/environment';


interface VglResponse<T> {
  data: T;
  msg: string;
  success: boolean;
}

function vglData<T>(response: VglResponse<T>): T {
  return response.data;
}

@Injectable()
export class VglService {

  constructor(private http: HttpClient) {}

  public get user(): Observable<User> {
    return this.http.get<VglResponse<User>>(environment.portalBaseUrl + 'secure/getUser.do')
      .map(vglData);
  }

  public get problems(): Observable<Problem[]> {
    return this.http.get<VglResponse<Problems>>(environment.portalBaseUrl + 'secure/getProblems.do')
      .map(vglData)
      .map(problems => problems.configuredProblems);
  }

  public get treeJobs(): Observable<TreeJobs> {
    return this.http.get<VglResponse<TreeJobs>>(environment.portalBaseUrl + 'secure/treeJobs.do')
        .map(vglData)
        .map(treeJob => treeJob);
  }

  public addFolder(folderName: string): Observable<Series> {
    folderName = folderName.trim();
    const options = { params: new HttpParams().set('seriesName', folderName).set('seriesDescription','') };
    return this.http.get<VglResponse<Series>>(environment.portalBaseUrl + 'secure/createFolder.do', options)
      .map(vglData)
      .map(series => series);
  }

  public getJobCloudFiles(jobId: number): Observable<CloudFileInformation[]> {
    const options = { params: new HttpParams().set('jobId', jobId.toString()) };
    return this.http.get<VglResponse<CloudFileInformation[]>>(environment.portalBaseUrl + 'secure/jobCloudFiles.do', options)
      .map(vglData)
      .map(fileDetails => fileDetails);
  }
  
  public downloadFile(jobId: number, filename: string, key: string): Observable<any> {
    const httpParams = new HttpParams().set('jobId', jobId.toString()).set('filename', filename).set('key', key);
    return this.http.get(environment.portalBaseUrl + 'secure/downloadFile.do', {
        params: httpParams,
        responseType: 'blob'
    }).map((response) => {
        return response;
    }).catch((error: Response) => {
        return Observable.throw(error);
    });
  }

  public downloadFilesAsZip(jobId: number, filenames: string[]): Observable<any> {
    const httpParams = new HttpParams().set('jobId', jobId.toString()).set('files', filenames.toString());
    return this.http.get(environment.portalBaseUrl + 'secure/downloadAsZip.do', {
        params: httpParams,
        responseType: 'blob'
    }).map((response) => {
        return response;
    }).catch((error: Response) => {
        return Observable.throw(error);
    });
  }
   
}
