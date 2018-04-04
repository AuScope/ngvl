import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { Problem, Problems, User, TreeJobs, Series } from './models';

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
      const options = {params: new HttpParams().set('seriesName', folderName).set('seriesDescription','') };
      return this.http.get<VglResponse<Series>>(environment.portalBaseUrl + 'secure/createFolder.do', options)
        .map(vglData)
        .map(series => series);
  }

  /*
  public get treeJobs(): Observable<TreeJobs> {
    return this.http.get<VglResponse<TreeJobs>>(environment.portalBaseUrl + 'secure/treeJobs.do')
      .map(vglData)
  }

  
  public get treeNodes(): Observable<TreeNode> {
    return this.http.get<VglResponse<TreeJobs>>(environment.portalBaseUrl + 'secure/treeJobs.do')
        .map(vglData)
        //.map(treeNodes => treeJobs.nodes);
        .map(treeNodes => treeNodes.nodes);
  }
  */
  

}
