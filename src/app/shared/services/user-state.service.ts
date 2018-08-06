import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ANONYMOUS_USER, Solution, SolutionQuery, User, NCIDetails, JobDownload, CloudFileInformation, BookMark, Job} from '../modules/vgl/models';

import { VglService } from '../modules/vgl/vgl.service';
import { saveAs } from 'file-saver/FileSaver';

export const DASHBOARD_VIEW = 'dashboard-view';
export const DATA_VIEW = 'data-view';
export const SOLUTIONS_VIEW = 'solutions-view';
export const JOBS_VIEW = 'jobs-view';

export type ViewType = 'dashboard-view' | 'data-view' | 'solutions-view' | 'jobs-view' | null;

@Injectable()
export class UserStateService {

    constructor(private vgl: VglService) {
        // Initialise a new Job object for the User
        this._job.next(this.createEmptyJob());
    }

    private _currentView: BehaviorSubject<ViewType> = new BehaviorSubject(null);
    public readonly currentView: Observable<ViewType> = this._currentView.asObservable();

    private _user: BehaviorSubject<User> = new BehaviorSubject(ANONYMOUS_USER);
    public readonly user: Observable<User> = this._user.asObservable();

    private _solutionQuery: BehaviorSubject<SolutionQuery> = new BehaviorSubject({});
    public readonly solutionQuery: Observable<SolutionQuery> = this._solutionQuery.asObservable();

    private _selectedSolutions: BehaviorSubject<Solution[]> = new BehaviorSubject([]);
    public readonly selectedSolutions: Observable<Solution[]> = this._selectedSolutions.asObservable();

    private _uploadedFiles: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public readonly uploadedFiles: Observable<any[]> = this._uploadedFiles.asObservable();

    private _jobDownloads: BehaviorSubject<JobDownload[]> = new BehaviorSubject([]);
    public readonly jobDownloads: Observable<JobDownload[]> = this._jobDownloads.asObservable();

    private _jobCloudFiles: BehaviorSubject<CloudFileInformation[]> = new BehaviorSubject([]);
    public readonly jobCloudFiles: Observable<CloudFileInformation[]> = this._jobCloudFiles.asObservable();

    private _bookmarks: BehaviorSubject<BookMark[]> = new BehaviorSubject([]);
    public readonly bookmarks: Observable<BookMark[]> = this._bookmarks.asObservable();

    private _job: BehaviorSubject<Job> = new BehaviorSubject(null);
    public readonly job: Observable<Job> = this._job.asObservable();

    public setView(viewType: ViewType): Observable<ViewType> {
        this._currentView.next(viewType);
        return this.currentView;
    }

    public updateUser() {
        this.vgl.user.subscribe(user => this._user.next(user));
    }

    public updateAnonymousUser() {
        this._user.next(ANONYMOUS_USER);
    }

    public updateBookMarks() {
        this.vgl.getBookMarks().subscribe(bookmarklist => this._bookmarks.next(bookmarklist));
    }

    public setUserAwsDetails(arnExecution: string, arnStorage: string, acceptedTermsConditions: number, awsKeyName: string): Observable<any> {
        return this.vgl.setUserDetails(arnExecution, arnStorage, acceptedTermsConditions, awsKeyName);
    }

    public getUserNciDetails(): Observable<NCIDetails> {
        return this.vgl.nciDetails;
    }

    public setUserNciDetails(nciUsername: string, nciProjectCode: string, nciKeyfile: any): Observable<any> {
        return this.vgl.setUserNciDetails(nciUsername, nciProjectCode, nciKeyfile);
    }

    public downloadCloudFormationScript() {
        this.vgl.downloadCloudFormationScript().subscribe(
            response => {
                saveAs(response, 'vgl-cloudformation.json');
            }, error => {
                // TODO: Proper error reporting
                console.log(error.message);
            }
        );
    }

    public setSolutionQuery(query: SolutionQuery) {
        this._solutionQuery.next(query);
    }

  public addSolutionToCart(solution: Solution) {
    // Add solution to the cart, unless it's already in.
    if (solution) {
      this.updateSolutionsCart((cart: Solution[]) => {
        if (!cart.includes(solution)) {
          return [...cart, solution];
        }

        return cart;
      });
    }
  }

  public removeSolutionFromCart(solution: Solution) {
    if (solution) {
      this.updateSolutionsCart((cart: Solution[]) => cart.filter(s => s['@id'] !== solution['@id']));
    }
  }

  public updateSolutionsCart(f: ((cart: Solution[]) => Solution[])): Solution[] {
    // Call the passed function to update the current selection.
    const solutions = f(this._selectedSolutions.getValue());

    // If we got a sensible value back (i.e. defined, empty is valid) then
    // update the current cart with the new value.
    if (solutions) {
      this._selectedSolutions.next(solutions);
    }

    // Return the new value so the caller can check that it worked.
    return solutions;
  }

  // Files User has uploaded for a Job
  public setUploadedFiles(files: any[]): void {
      this._uploadedFiles.next(files);
  }

  public addUploadedFile(file: any) {
      let uploadedFiles: any[] = this._uploadedFiles.getValue();
      uploadedFiles.push(file);
      this._uploadedFiles.next(uploadedFiles);
  }

  public removeUploadedFile(file: any): void {
      let uploadedFiles: any[] = this._uploadedFiles.getValue();
      uploadedFiles.forEach((item, index) => {
        if(item === file) {
            uploadedFiles.splice(index, 1);
        }
      });
      this._uploadedFiles.next(uploadedFiles);
  }

  // Remote web services User requests as Job inputs. Whether parent (Job)
  // field is set determines if it's newly selected or copied from an existing
  // Job
  public setJobDownloads(jobDownloads: JobDownload[]) {
      this._jobDownloads.next(jobDownloads);
  }

  public addJobDownload(jobDownload: JobDownload) {
      let jobDownloads: JobDownload[] = this._jobDownloads.getValue();
      jobDownloads.push(jobDownload);
      this._jobDownloads.next(jobDownloads);
  }

  public removeJobDownload(jobDownload: JobDownload): void {
    let jobDownloads: any[] = this._jobDownloads.getValue();
    jobDownloads.forEach((item, index) => {
      if(item === jobDownload) {
          jobDownloads.splice(index, 1);
      }
    });
    this._jobDownloads.next(jobDownloads);
  }

  // Copied cloud files User requests for a Job (input)
  public setJobCloudFiles(jobCloudFiles: CloudFileInformation[]) {
    this._jobCloudFiles.next(jobCloudFiles);
  }

  public addJobCloudFile(cloudFile: CloudFileInformation) {
      let cloudFiles: CloudFileInformation[] = this._jobCloudFiles.getValue();
      cloudFiles.push(cloudFile);
      this._jobCloudFiles.next(cloudFiles);
  }

  public removeJobCloudFile(cloudFile: CloudFileInformation): void {
    let cloudFiles: any[] = this._jobCloudFiles.getValue();
    cloudFiles.forEach((item, index) => {
      if(item === cloudFile) {
          cloudFiles.splice(index, 1);
      }
    });
    this._jobCloudFiles.next(cloudFiles);
  }

  private createEmptyJob(): Job {
    let job = {
        id: -1,
        name: "",
        description: "",
        emailAddress: "",
        user: "",
        submitDate: null,
        processDate: null,
        status: "",
        computeVmId: "",
        computeInstanceId: null,
        computeInstanceType: "",
        computeInstanceKey: "",
        computeServiceId: "",
        computeTypeId: "",
        storageBaseKey: "",
        storageServiceId: "",
        registeredUrl: "",
        seriesId: null,
        emailNotification: false,
        processTimeLog: "",
        storageBucket: "",
        promsReportUrl: "",
        computeVmRunCommand: "",
        useWalltime: false, // Not part of VEGLJob, but needed for job object UI
        walltime: null,
        containsPersistentVolumes: false,
        executeDate: null,
        jobParameters: [],
        jobDownloads: [],
        jobFiles: []
    }
    return job;
  }

}
