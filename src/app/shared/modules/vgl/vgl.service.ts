import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { Problem, Problems, User, TreeJobs } from './models';

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
