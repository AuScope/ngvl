import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

import { BehaviorSubject, EMPTY, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

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
  private datePipe = new DatePipe('en-AU');

  constructor(private vgl: VglService) {}

    private _currentView: BehaviorSubject<ViewType> = new BehaviorSubject(null);
    public readonly currentView: Observable<ViewType> = this._currentView.asObservable();

    private _user: BehaviorSubject<User> = new BehaviorSubject(ANONYMOUS_USER);
    public readonly user: Observable<User> = this._user.asObservable();

    private _nciDetails: BehaviorSubject<NCIDetails> = new BehaviorSubject(null);
    public readonly nciDetails: Observable<NCIDetails> = this._nciDetails.asObservable();

    private _solutionQuery: BehaviorSubject<SolutionQuery> = new BehaviorSubject({});
    public readonly solutionQuery: Observable<SolutionQuery> = this._solutionQuery.asObservable();

    private _selectedSolutions: BehaviorSubject<Solution[]> = new BehaviorSubject([]);
    public readonly selectedSolutions: Observable<Solution[]> = this._selectedSolutions.asObservable();

    private _jobTemplate: BehaviorSubject<string> = new BehaviorSubject('');
    public readonly jobTemplate: Observable<string> = this._jobTemplate.asObservable();

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

    public updateUser(): Observable<any> {
        return this.vgl.user.map(user => {
                // If full name is empty (as with AAF login), use email address as name
                if (user.fullName === undefined || user.fullName === "") {
                    user.fullName = user.email;
                }
                // For a new user AWS details may be null, set to empty string if so
                user.arnExecution = user.arnExecution ? user.arnExecution : "";
                user.arnStorage = user.arnStorage ? user.arnStorage : "";
                user.awsKeyName = user.awsKeyName ? user.awsKeyName : "";
                this._user.next(user);
                // Update NCI details (if they exist)
                this.vgl.nciDetails.subscribe(
                    nciDetails => {
                        this._nciDetails.next(nciDetails);
                    }, error => {}
                );
            },
            // Failure to retrieve User means no User logged in
            error => {
                this.updateAnonymousUser();
            }
        );
    }

    public updateAnonymousUser() {
        this._user.next(ANONYMOUS_USER);
    }

    public updateNciDetails() {
        this.vgl.nciDetails.subscribe(
            nciDetails => {
                this._nciDetails.next(nciDetails);
            }
        );
    }

    public updateBookMarks() {
        this.vgl.getBookMarks().subscribe(bookmarklist => this._bookmarks.next(bookmarklist));
    }

    public setUserAwsDetails(arnExecution: string, arnStorage: string, acceptedTermsConditions: number, awsKeyName: string): Observable<any> {
        return this.vgl.setUserDetails(arnExecution, arnStorage, acceptedTermsConditions, awsKeyName);
    }

    public setUserNciDetails(nciUsername: string, nciProjectCode: string, nciKeyfile: any): Observable<any> {
        return this.vgl.setUserNciDetails(nciUsername, nciProjectCode, nciKeyfile);
    }

    public getTermsAndConditions(): Observable<any> {
        return this.vgl.getTermsAndConditions();
    }

    public getHasConfiguredComputeServices(): Observable<any> {
        return this.vgl.getHasConfiguredComputeServices();
    }

    public acceptTermsAndConditions(): void {
        this.vgl.user.subscribe(
            user => {
                if (user.acceptedTermsConditions !== 1) {
                    user.acceptedTermsConditions = 1;
                    this._user.next(user);
                }
            },
            error => {
                // TODO: Proper error reporting
                console.log(error.message);
            }
        );
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
            const check = (s: Solution) => {
                return s["@id"] === solution["@id"];
              };

            this.updateSolutionsCart((cart: Solution[]) => {
                if (!cart.find(check)) {
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

  /**
   * Return the current contents of the user's solutions cart.
   */
  public getSolutionsCart(): Solution[] {
    return this._selectedSolutions.getValue();
  }

  /**
   * Sets the current selection in the cart to the passed solutions.
   *
   * @param solutions Array of Solution objects to use as the current selection.
   */
  public setSolutionsCart(solutions: Solution[]) {
    const newCart = solutions ? solutions : [];
    this._selectedSolutions.next(newCart);
  }

  public updateJobTemplate(template: string) {
    this._jobTemplate.next(template);
  }

  /**
   * Return the current value of the job template.
   */
  public getJobTemplate(): string {
    return this._jobTemplate.getValue();
  }

  public getUploadedFiles(): any[] {
    return this._uploadedFiles.getValue();
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

  public getJobDownloads(): JobDownload[] {
    return this._jobDownloads.getValue();
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

  /**
   * Update the user's current job object with job.
   *
   * @param job The new Job object
   * @returns The new Job object
   */
  public updateJob(job: Job): Job {
    this._job.next(job);
    return job;
  }

  /**
   * Return the current state of the user Job object.
   */
  public getJob(): Job {
    return this._job.getValue();
  }

  /**
   * Return a new, empty Job object.
   */
  public createEmptyJob(initialValues = {}): Job {
    const job = {
        id: null,
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
        computeServiceId: null,
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
        jobFiles: [],
        jobSolutions: []
    }

    return Object.assign(job, initialValues);
  }

  /**
   * Load the job specified by id from the server into the current
   * user state. By default reset the user selections (solutions and datasets)
   * to match the loaded job. If keepUserSelections is true then do not update
   * the current selections, and just load the job object.
   *
   * @param id The id for the job to load
   * @param keepUserSelections  whether to keep current user selections (default false)
   *
   */
  public loadJob(id: number, keepUserSelections = false): Observable<Job> {
    return this.vgl.getJob(id).pipe(
      // Update the current job object, after "decoding" any HPC style instance
      // type into cpu/ram/fs.
      map(job => this.updateJob(this.vgl.decodeHPCInstanceType(job))),

      map(job => {
        if (!keepUserSelections) {
          // Update the cart with the new solutions, ignoring any existing
          // selections, unless requested not to.
          if (job.jobSolutions) {
            this.vgl.getSolutions(job.jobSolutions)
              .subscribe(solutions => this.setSolutionsCart(solutions));
          }

          // Update dataset selections unless requested not to
          if (job.jobDownloads) {
            this.setJobDownloads(job.jobDownloads);
          }
        }

        return job;
      }),

      catchError((err, caught) => {
        console.log('Failed to load job ' + id);
        console.log(err);
        console.log(caught);
        return EMPTY;
      })
    );
  }

  /**
   * Create and load a new empty job, keeping any existing user selections. Note
   * that this does not persist the job object on the server.
   */
  public newJob(): Observable<Job> {
    // Create a new job with a default name
    const name = "VGL Job - " + this.datePipe.transform(new Date(), 'medium')
    const job = this.createEmptyJob({name: name});

    return of(this.updateJob(job));
  }
}
