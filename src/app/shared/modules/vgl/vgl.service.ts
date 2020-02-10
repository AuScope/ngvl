import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable, of, throwError, forkJoin, EMPTY } from 'rxjs';
import { switchMap, map, defaultIfEmpty } from 'rxjs/operators';

import { Job, Problem, Problems, Solution, User, TreeJobs, Series, CloudFileInformation, DownloadOptions, JobDownload, NCIDetails, BookMark, ComputeService, MachineImage, ComputeType, Entry } from './models';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';

import { environment } from '../../../../environments/environment';


interface VglResponse<T> {
    data: T;
    msg: string;
    success: boolean;
}

function vglData<T>(response: VglResponse<T>): Observable<T> {
  // Convert a VGL error into an Observable error
  if (!response.success) {
    console.log('VGL response error: ' + JSON.stringify(response));
    return throwError(response.msg);
  }

  // Otherwise, wrap the response data in a new Observable an return.
  return of(response.data);
}

@Injectable()
export class VglService {

  constructor(private http: HttpClient) { }

  private vglRequest<T>(endpoint: string, options: any = {}): Observable<T> {
    const params = options.params || {};
    const opts = {...options};
    delete opts.params;
    return this.vglGet<T>(endpoint, params, opts);
  }

  private vglPost<T>(endpoint: string, params = {}, options = {}): Observable<T> {
    const url = environment.portalBaseUrl + endpoint;

    const body = new FormData();
    for (const key in params) {
      const val = params[key];
      if (Array.isArray(val)) {
        val.forEach(v => body.append(key, v));
      } else {
        body.append(key, val);
      }
    }

    const opts: { observe: 'body' } = { ...options, observe: 'body' };

    return this.http.post<VglResponse<T>>(url, body, opts).pipe(switchMap(vglData));
  }

  private vglGet<T>(endpoint: string, params = {}, options?): Observable<T> {
    const url = environment.portalBaseUrl + endpoint;
    const opts: { observe: 'body' } = { ...options, observe: 'body', params: params };

    return this.http.get<VglResponse<T>>(url, opts).pipe(switchMap(vglData));
  }

    public get user(): Observable<User> {
        return this.vglRequest('secure/getUser.do');
    }

  public get problems(): Observable<Problem[]> {
    return this.vglRequest('secure/getProblems.do').pipe(
      // Unwrap the problems from the response.
      map((resp: Problems) => resp.configuredProblems),

      // As a convenience, update the '@id' properties into 'id' properties.
      map((problems: Problem[]) => {
        problems.forEach(problem => {
          problem.id = problem['@id'];
          if (problem.solutions) {
            problem.solutions.forEach(solution => solution.id = solution['@id']);
          }
        });
        return problems;
      })
    );
  }

    public get treeJobs(): Observable<TreeJobs> {
        return this.vglRequest('secure/treeJobs.do');
    }

    public addFolder(folderName: string): Observable<Series> {
        const options = {
            params: {
                seriesName: folderName.trim(),
                seriesDescription: ''
            }
        };

        return this.vglRequest('secure/createFolder.do', options);
    }

    public setJobFolder(jobId: number[], seriesId: number): Observable<any> {

        const options = {
            params: {
                jobIds: jobId.join(','),
            }
        };
        if (seriesId) {
            options.params['seriesId'] = seriesId;
        }
        return this.vglRequest('secure/setJobFolder.do', options);
    }

    public getJobStatuses(): Observable<any> {
        return this.vglRequest('secure/jobsStatuses.do');
    }

    public getJobCloudFiles(jobId: number): Observable<CloudFileInformation[]> {
        const options = { params: { jobId: jobId.toString() } };
        return this.vglRequest('secure/jobCloudFiles.do', options);
    }

    public get nciDetails(): Observable<NCIDetails> {
        return this.vglRequest('secure/getNCIDetails.do');
    }

    public setUserDetails(arnExecution: string, arnStorage: string, acceptedTermsConditions: number, awsKeyName: string): Observable<any> {
        const options = {
            params: {
                arnExecution: arnExecution,
                arnStorage: arnStorage,
                acceptedTermsConditions: acceptedTermsConditions.toString(),
                awsKeyName: awsKeyName
            }
        };
        return this.vglRequest('secure/setUser.do', options);
    }

    public setUserNciDetails(nciUsername: string, nciProjectCode: string, nciKeyfile: any): Observable<any> {
        let formData: FormData = new FormData();
        if (nciKeyfile) {
            formData.append('nciKey', nciKeyfile);
        }
        const options = {
            params: {
                nciUsername: nciUsername,
                nciProject: nciProjectCode
            }
        };
        return this.http.post(environment.portalBaseUrl + 'secure/setNCIDetails.do', formData, options);
    }

    public getTermsAndConditions(): Observable<any> {
        return this.http.get(environment.portalBaseUrl + "getTermsConditions.do");
    }

    public getHasConfiguredComputeServices(): Observable<any> {
        return this.http.get(environment.portalBaseUrl + "secure/getHasConfiguredComputeServices.do");
    }

    public downloadCloudFormationScript(): Observable<any> {
        return this.http.get(environment.portalBaseUrl + 'secure/getCloudFormationScript.do', {
            responseType: 'blob'
        }).map(response => {
            return response;
        });
    }

    public downloadFile(jobId: number, filename: string, key: string): Observable<any> {
        return this.http.get(environment.portalBaseUrl + 'secure/downloadFile.do', {
            params: {
                jobId: jobId.toString(),
                filename: filename,
                key: key
            },
            responseType: 'blob'
        }).map((response) => {
            return response;
        }).catch((error: Response) => {
            return Observable.throw(error);
        });
    }

    public downloadFilesAsZip(jobId: number, filenames: string[]): Observable<any> {
        return this.http.get(environment.portalBaseUrl + 'secure/downloadAsZip.do', {
            params: {
                jobId: jobId.toString(),
                files: filenames.toString()
            },
            responseType: 'blob'
        }).map((response) => {
            return response;
        }).catch((error: Response) => {
            return Observable.throw(error);
        });
    }

    public getPlaintextPreview(jobId: number, file: string, maxSize: number): Observable<string> {
        const options = {
            params: {
                jobId: jobId.toString(),
                file: file,
                maxSize: maxSize.toString()
            }
        };

        return this.vglRequest('secure/getPlaintextPreview.do', options);
    }

    public getSectionedLogs(jobId: number): Observable<any> {
        const options = {
            params: {
                jobId: jobId.toString()
            }
        };

        return this.vglRequest('secure/getSectionedLogs.do', options);
    }

    public deleteJob(jobId: number): Observable<any> {
        const options = {
            params: { jobId: jobId.toString() }
        };

        return this.vglRequest('secure/deleteJob.do', options);
    }

    public deleteSeries(seriesId: number): Observable<any> {
        const options = {
            params: { seriesId: seriesId.toString() }
        };

        return this.vglRequest('secure/deleteSeriesJobs.do', options);
    }

  /**
   * Return the Job object for the specified job id if available.
   *
   */
  public getJob(jobId: number): Observable<Job> {
    return this.vglGet<Job[]>('secure/getJobObject.do', { jobId: jobId }).pipe(
      // getJobObject.do returns an array of one job, so extract it from the array.
      map(jobs => jobs[0])
    );
  }

    public cancelJob(jobId: number): Observable<any> {
        const options = {
            params: { jobId: jobId.toString() }
        };

        return this.vglRequest('secure/killJob.do', options);
    }

    public duplicateJob(jobId: number/*, files: string[]*/): Observable<Job[]> {
        const options = {
            params: {
                jobId: jobId.toString() // ,
                // files: files.join(',')
            }
        };

        return this.vglRequest('secure/duplicateJob.do', options);
    }

  public submitJob(job: Job): Observable<any> {
    const params = { jobId: job.id };
    return this.vglGet('secure/submitJob.do', params);
  }

  public saveJob(job: Job,
                 downloads: JobDownload[],
                 template: string,
                 solutions: Solution[],
                 files: any[]): Observable<Job> {
    // Ensure the job object is created/updated first, which also ensures we
    // have a job id for the subsequent requests.
    return this.updateJob(job).pipe(
      // Update downloads for the job, and pass along the updated job object.
      switchMap(job => this.updateJobDownloads(job, downloads).pipe(map(() => job))),

      // Next associate the template with the job, and if we succeed then return
      // the updated job object.
      switchMap(job => this.saveScript(template, job, solutions).pipe(map(() => job))),
      switchMap(job => this.uploadFiles(job, files).pipe(map(() => job))),
    );
  }

  public updateJobDownloads(job: Job, downloads: JobDownload[]): Observable<any> {
    // If we have no downloads then skip the request.
    if (downloads.length === 0) {
      return of(null);
    }

    const names: string[] = [];
    const descriptions: string[] = [];
    const urls: string[] = [];
    const localPaths: string[] = [];

    for (const download of downloads) {
      names.push(download.name);
      descriptions.push(download.description);
      urls.push(download.url);
      localPaths.push(download.localPath);
    }

    const params = {
      id: job.id,
      append: false, // Replace job downloads with new set
      name: names,
      description: descriptions,
      url: urls,
      localPath: localPaths
    };

    // Use a POST request since the download descriptions could get very large.
    return this.vglPost('secure/updateJobDownloads.do', params);
  }

  public saveScript(template: string, job: Job, solutions: Solution[]): Observable<any> {
    const params = {
      jobId: job.id,
      sourceText: template,
      solutions: solutions.map(s => s['@id'])
    };

    // Use a POST request since the template is arbitrarily large.
    return this.vglPost('secure/saveScript.do', params);
  }

  public uploadFiles(job: Job, files: any[]): Observable<any> {

    let headers = new Headers();
    headers.append('enctype', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    let options = { headers };

    const requests = files.map(file => {
      const params = { file: file, jobId: job.id };
      return this.vglPost('secure/uploadFile.do', params, options);
    });

    return forkJoin(requests).pipe(defaultIfEmpty([]));
  }

  public updateJob(job: Job): Observable<Job> {
    // Copy the properties of the job for the request parameters.
    const params = {...job};

    // Update params object so that it's properties match the parameters
    // expected by the server.
    for (const p of Object.getOwnPropertyNames(job)) {
      // Remove any properties that are undefined, so they do not get included in
      // the request parameters.
      if (params[p] === undefined || params[p] === null) {
        delete params[p];
      }
    }

    // If no job id is supplied then updateOrCreateJob.do will create a new job
    // with the supplied parameters. So remove the id from job if it's not a
    // valid job id.
    if (params.hasOwnProperty('id') && params.id === -1) {
      delete params.id;
    }

    if (!params.computeServiceId) {
        delete params.computeServiceId;
    }

    return this.vglGet('secure/updateOrCreateJob.do', params)
      .pipe(
        map((jobs: Job[]) => {
          // Should always be only 1 job.
          if (jobs.length > 0) {
            return jobs[0];
          }

          return null;
        })
      );
  }

  /**
   * If job is an HPC job update it with ncpus/mem/jobfs parameters decoded from the "instance type".
   * If not an HPC job then no change.
   *
   * @param job The Job object to update
   * @returns the updated Job.
   */
  public decodeHPCInstanceType(job: Job): Job {
    if (this.isHPCProvider(job.computeServiceId)) {
      for (const kvp of job.computeInstanceType.split('&')) {
        const [key, value] = kvp.split('=');

        // Values should all be numbers, after stripping off any units
        // designator ('gb').
        const num = parseInt(value.endsWith('gb') ? value.slice(0, -2) : value, 10);
        if (isNaN(num)) {
          console.log('Bad HPC instance type parameter: ' + key + ' = ' + value);
        } else {
          job[key] = num;
        }
      }
    } else {
      job.computeTypeId = job.computeInstanceType;
    }

    return job;
  }

  public getComputeServices(jobId?: number): Observable<ComputeService[]> {
    const params: {jobId?: number} = {};
    if (jobId != null) {
      params.jobId = jobId;
    }

    return this.vglGet('secure/getComputeServices.do', params);
  }

  /**
   * Retrieve toolbox images for specified compute service and job or solutions.
   *
   * If a list of solutions is specified, that will be used to determine valid
   * images. If no solutions are provided and a job id is, then the solutions
   * saved with the job will be used to determine valid images. At least one of
   * jobId and solutions must be provided.
   *
   * @param computeServiceId string id of the compute service provider
   * @param solutions array of solution ids to use
   * @param jobId number id for the job to use
   * @returns Observable<MachineImage[]> with valid machine images
   *
   */
  public getMachineImages(computeServiceId: string, solutions: string[] = [], jobId?: number): Observable<MachineImage[]> {
    const params: {
      computeServiceId: string,
      solutions?: string[],
      jobId?: number
    } = {
      computeServiceId: computeServiceId,
      solutions: solutions
    };

    if (jobId != null) {
      params.jobId = jobId;
    }

    return this.vglPost('secure/getVmImagesForComputeService.do', params);
  }

  public getComputeTypes(computeServiceId: string, machineImageId: string): Observable<ComputeType[]> {
    const params = {
      computeServiceId: computeServiceId,
      machineImageId: machineImageId
    };

    return this.vglGet('secure/getVmTypesForComputeService.do', params).pipe(
      // VGL is not consistent about whether compute types get descriptions or
      // not. AWS for example uses "descriptive" ids and no descriptions, while
      // Nectar has opaque ids and user-friendly descriptions. To work around
      // this, if no description is provided then copy the id text into the
      // description field.
      map(this.updateComputeTypeDescriptions)
    );
  }

    public getAuditLogs(jobId: number): Observable<any> {
        const options = {
            params: { jobId: jobId.toString() }
        };

        return this.vglRequest('secure/getAuditLogsForJob.do', options);
    }

    /**
     * Create a list of parameters by parsing URL string, e.g:
     * "http://someaddress.com?first_parameter=value1&second_parameters=value2"
     * returns: { first_parameter: 'value1', second_parameter: 'value2'}
     *
     * @param url
     */
    /*
    private createParamsFromUrl(url: string): any {
        let params: {};
        const urlParameters: string[] = url.split('?');
        if (urlParameters.length == 2) {
            for (let keyValuePair in urlParameters[1].split('&')) {
                params[keyValuePair.split('=')[0]] = keyValuePair.split('=')[1];
            }
        }
        return params;
    }
    */

    public makeErddapUrl(dlOptions: DownloadOptions): Observable<JobDownload> {
        const options = {
            params: dlOptions
        };
        return this.vglRequest('makeErddapUrl.do', options);
    }

    public makeWfsUrl(dlOptions: DownloadOptions): Observable<JobDownload> {
        const options = {
            params: dlOptions
        };
        return this.vglRequest('makeWfsUrl.do', options);
    }

    public makeNetcdfsubseserviceUrl(dlOptions: DownloadOptions): Observable<JobDownload> {
        const options = {
            params: dlOptions
        };
        return this.vglRequest('makeNetcdfsubseserviceUrl.do', options);
    }

    public makeDownloadUrl(dlOptions: DownloadOptions): Observable<JobDownload> {
        const options = {
            params: dlOptions
        };
        return this.vglRequest('makeDownloadUrl.do', options);
    }

    public getRequestedOutputFormats(serviceUrl: string): Observable<any> {
        const options = {
            params: { serviceUrl: serviceUrl }
        };
        return this.vglRequest('getFeatureRequestOutputFormats.do', options);
    }

  public getEntry<T extends Entry>(url: string): Observable<T> {
    if (!url) {
      return EMPTY;
    }

    return this.http.get<T>(url).pipe(
      // As a convenience, copy the '@id' property into the 'id' property.
      map(entry => {
        entry.id = entry['@id'];
        return entry;
      })
    );
  }

    public getSolution(url: string): Observable<Solution> {
        return this.getEntry<Solution>(url);
    }

  public getSolutions(urls: string[]): Observable<Solution[]> {
    const requests = urls.map(url => this.getSolution(url));
    return forkJoin(requests);
  }

    // Add to database dataset information that is bookmarked
    public addBookMark(fileIdentifier: string, serviceId: string): Observable<number> {
        const options = {
            params: {
                fileIdentifier: fileIdentifier,
                serviceId: serviceId
            }
        };
        return this.vglRequest('addBookMark.do', options);
    }

    // remove book mark information from database
    public removeBookMark(id: number) {
        const options = {
            params: {
                id: id.toString()
            }
        };
        return this.vglRequest('deleteBookMark.do', options);
    }

    // get list of bookmarks for a user
    public getBookMarks(): Observable<BookMark[]> {
        return this.vglRequest('getBookMarks.do');
    }

    /**
     * @param bookMark get download options associated with a book mark
     */
    public getDownloadOptions(bookmarkId: number): Observable<DownloadOptions[]> {
        const options = {
            params: {
                bookmarkId: bookmarkId.toString()
            }
        };
        return this.vglRequest('getDownloadOptions.do', options);
    }

    /**
     * @param bookMark save download options associated with a book mark
     */
    public bookMarkDownloadOptions(bookmarkId: number, downloadOptions: DownloadOptions): Observable<number> {
        const options = {
            params: {
                bookmarkId: bookmarkId.toString(),
                bookmarkOptionName: downloadOptions.bookmarkOptionName,
                url: downloadOptions.url,
                localPath: downloadOptions.localPath,
                name: downloadOptions.name,
                description: downloadOptions.description,
                northBoundLatitude: downloadOptions.northBoundLatitude,
                eastBoundLongitude: downloadOptions.eastBoundLongitude,
                southBoundLatitude: downloadOptions.southBoundLatitude,
                westBoundLongitude: downloadOptions.westBoundLongitude
            }
        };
        return this.vglRequest('saveDownloadOptions.do', options);
    }

    /**
     * @param bookMark delete download options associated with a book mark
     */
    public deleteDownloadOptions(optionsId: number): Observable<any> {
        const options = { params: { id: optionsId } };
        return this.vglRequest('deleteDownloadOptions.do', options);
    }

    // gets csw record information based on fileter parameters such as file identifier and service id
    public getFilteredCSWRecord(fileIdentifier: string, serviceId: string): Observable<CSWRecordModel[]> {
        const options = {
            params: {
                fileIdentifier: fileIdentifier,
                serviceId: serviceId
            }
        };
        return this.vglRequest('getCSWRecord.do', options);
    }

    // gets registry information to be used in faceted search and bookmarking of a dataset
    public getAvailableRegistries(): Observable<any> {
        return this.vglRequest('getFacetedCSWServices.do');
    }

  /**
   * Return true if providerId identifies a cloud compute service provider.
   */
  public isCloudProvider(providerId: string): boolean {
    return providerId !== 'nci-gadi-compute';
  }

  /**
   * Return true if providerId identifies an HPC compute service provider.
   */
  public isHPCProvider(providerId: string): boolean {
    return providerId === 'nci-gadi-compute';
  }

  updateComputeTypeDescriptions(computeTypes: ComputeType[]): ComputeType[] {
    return computeTypes.map(computeType => {
      const description = computeType.description || computeType.id;
      return {
        ...computeType,
        description: description
      };
    });
  }
}
