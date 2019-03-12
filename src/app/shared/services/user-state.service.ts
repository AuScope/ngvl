import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, EMPTY, Observable, of, forkJoin } from 'rxjs';
import { catchError, map, defaultIfEmpty } from 'rxjs/operators';

import { ANONYMOUS_USER, Solution, SolutionQuery, User, NCIDetails, JobDownload, CloudFileInformation, BookMark, Job} from '../modules/vgl/models';

import { VglService } from '../modules/vgl/vgl.service';
import { isSolution, Variable } from '../modules/vgl/models';
import { saveAs } from 'file-saver';

import {
  SolutionVarBindings,
  VarBinding,
  VarBindingOptions,
  StringEntryBinding,
  NumberEntryBinding,
  OptionsBinding,
  BooleanBinding
} from '../modules/solutions/models';

export const DASHBOARD_VIEW = 'dashboard-view';
export const DATA_VIEW = 'data-view';
export const SOLUTIONS_VIEW = 'solutions-view';
export const JOBS_VIEW = 'jobs-view';

export type ViewType = 'dashboard-view' | 'data-view' | 'solutions-view' | 'jobs-view' | null;

@Injectable()
export class UserStateService {
  private datePipe = new DatePipe('en-AU');

  private _solutionVarPrefixMap: { [key: string]: number } = {};

  constructor(private vgl: VglService, private http: HttpClient) {}

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

    private _solutionBindings: BehaviorSubject<SolutionVarBindings> = new BehaviorSubject({});
    public readonly solutionBindings: Observable<SolutionVarBindings> = this._solutionBindings.asObservable();

    private _jobTemplate: BehaviorSubject<string> = new BehaviorSubject('');
    public readonly jobTemplate: Observable<string> = this._jobTemplate.asObservable();
    public readonly jobTemplateWithVars: Observable<string> = this.jobTemplate.pipe(
      map(template => this._subBindingsIntoTemplate(template))
    );

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
                    }, () => { }
                );
            },
            // Failure to retrieve User means no User logged in
            () => {
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
    // update the current cart with the new value, merge any new bindings
    // into the current set and regenerate the solution template.
    if (solutions) {
      this._selectedSolutions.next(solutions);
      this._mergeSolutions(solutions);
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
    // Delegate to the update method, ignoring any existing cart.
    this.updateSolutionsCart(() => solutions || []);
  }

  /**
   * Set the current template
   *
   * @param template New job template string.
   */
  public updateJobTemplate(template: string) {
    this._jobTemplate.next(template);
  }

  /**
   * Reset the job template based on the current solutions.
   *
   */
  public resetJobTemplate() {
    // Regenerate the template for the new solutions, and update any variable
    // placeholders using the prefix-variable mapping to avoid name clashes.
    const requests = this._selectedSolutions.getValue()
      .map(solution => this._makeTemplateRequest(solution));
    forkJoin(requests)
      .pipe(defaultIfEmpty([]))
      .subscribe(templates => this.updateJobTemplate(templates.join('\n\n')));

  }

  public setSolutionBindings(bindings: SolutionVarBindings) {
    // Update the bindings
    this._solutionBindings.next(bindings);
  }

  public updateSolutionBindings(solution: Solution, bindings: VarBinding<any>[]);
  public updateSolutionBindings(varBindings: SolutionVarBindings);
  public updateSolutionBindings(s, bindings?) {
    let newBindings: SolutionVarBindings;

    if (isSolution(s)) {
      // Copy the current value rather than modifying the stored value.
      newBindings = {...this._solutionBindings.getValue()};
      newBindings[s.id] = bindings;
    } else {
      newBindings = s;
    }

    // Replace the current set of bindings
    this.setSolutionBindings(newBindings);
  }

  public getSolutionBindings(): SolutionVarBindings {
    return this._solutionBindings.getValue();
  }

  /**
   * Return the current value of the job template.
   */
  public getJobTemplate(): string {
    return this._jobTemplate.getValue();
  }

  /**
   * Return the current job template after substituting in all variable values.
   */
  public getJobTemplateWithVars(): string {
    return this._subBindingsIntoTemplate(this._jobTemplate.getValue());
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
        if (item === file) {
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
      if (item === jobDownload) {
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
      if (item === cloudFile) {
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
    };
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
    const name = "VGL Job - " + this.datePipe.transform(new Date(), 'medium');
    const job = this.createEmptyJob({name: name});

    return of(this.updateJob(job));
  }

  private _subBindingsIntoTemplate(template) {
    const bindings = [].concat(...Object.values(this._solutionBindings.getValue()));
    return this._replaceInTemplate(template, key => {
      const b = bindings.find(it => it.key === key);
      if (b && b.value !== undefined) {
        return b.value;
      }
    });
  }

  private _replaceVarPlaceholders(template: string, prefix: any) {
    return this._replaceInTemplate(template, key => {
      return `\${${prefix}-${key}}`;
    });
  }

  private _replaceInTemplate(template: string, lookup: (key: string) => any) {
    return template.replace(/\$\{([a-zA-Z0-9_-]+)\}/g,
                            (match, p1) => {
                              const value = lookup(p1);
                              return (value !== undefined) ? value : match;
                            });
  }

  private _makeTemplateRequest(solution: Solution): Observable<string> {
    return this.http.get(solution.template, { responseType: 'text' }).pipe(
      // Update variable placeholders using prefix-variable mapping.
      map(template => {
        const prefix = this._solutionVarPrefixMap[solution.id];
        return this._replaceVarPlaceholders(template, prefix);
      }),

      // Catch http errors
      catchError(err => {
        console.log('Request error in UserStateService.makeTemplateRequest: ' + err.message);
        return Observable.of<string>('');
      })
    );
  }

  /**
   * Reset the solution variable bindings based on the new solutions, merging in
   * any existing bindings the user has set for the given solutions.
   *
   * Also update the solution variable prefix mapping for resolving variable
   * name clashes across templates.
   */
  private _mergeSolutions(solutions: Solution[]) {
    // Start with any existing bindings
    let varBindings = {...this._solutionBindings.getValue()};

    // Create and merge bindings for new solutions
    solutions.forEach(solution => {
      // Create default bindings for solution if none already exist
      const id = solution.id;
      if (!(id in varBindings)) {
        const prefix = this._getVarPrefix(solution);
        varBindings[id] = solution.variables
          .map(v => {
            const name = `${prefix}-${v.name}`;
            return {...v, name: name};
          })
          .map(this._createBinding);
      }
    });

    this.updateSolutionBindings(varBindings);
    this.resetJobTemplate();
  }

  private _getVarPrefix(solution: Solution): number {
    if (!(solution.id in this._solutionVarPrefixMap)) {
      let prefix = 0;
      while (prefix in Object.values(this._solutionVarPrefixMap)) {
        prefix = prefix + 1;
      }
      this._solutionVarPrefixMap[solution.id] = prefix;
    }
    return this._solutionVarPrefixMap[solution.id];
  }

  private _createBinding(v: Variable): VarBinding<any> {
    let b: VarBinding<any>;
    const options: VarBindingOptions<any> = {
      key: v.name,
      label: v.label,
      description: v.description,
      required: !v.optional
    };

    if (v.default !== undefined) {
      options.value = v.default;
    }

    if (v.values) {
      options.options = v.values;
    }

    if (v.type === "file") {
      // File inputs are always dropdowns, with options populated from the
      // current set of selected downloads.
      b = new OptionsBinding<string>(options);

    } else if (v.type === "int") {
      options.step = v.step || 1;
      if (v.min != null) {
        options.min = v.min;
      }
      if (v.max != null)  {
        options.max = v.max;
      }
      b = options.options ? new OptionsBinding<number>(options) : new NumberEntryBinding(options);

    } else if (v.type === "double") {
      options.step = v.step || 0.01;
      if (v.min != null) {
        options.min = v.min;
      }
      if (v.max != null)  {
        options.max = v.max;
      }
      b = options.options ? new OptionsBinding<number>(options) : new NumberEntryBinding(options);

    } else if (v.type === "string") {
      b = options.options ? new OptionsBinding<number>(options) : new StringEntryBinding(options);

    } else if (v.type === "boolean") {
      b = new BooleanBinding(options);
    }

    return b;
  }

}
