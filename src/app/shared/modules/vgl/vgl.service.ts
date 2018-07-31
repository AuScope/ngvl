import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { Problem, Problems, Solution, User, TreeJobs, Series, CloudFileInformation, DownloadOptions, JobDownload, NCIDetails, BookMark, Registry } from './models';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';

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

    constructor(private http: HttpClient) { }

    private vglRequest<T>(endpoint: string, options?): Observable<T> {
        const url = environment.portalBaseUrl + endpoint;
        const opts: { observe: 'body' } = options ? { ...options, observe: 'body' } : { observe: 'body' };
        return this.http.get<VglResponse<T>>(url, opts).map(vglData);
    }

    public get user(): Observable<User> {
        return this.vglRequest('secure/getUser.do');
    }

    public get problems(): Observable<Problem[]> {
        return this.vglRequest('secure/getProblems.do')
            .map((problems: Problems) => problems.configuredProblems);
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
        }
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
        }
        return this.http.post(environment.portalBaseUrl + 'secure/setNCIDetails.do', formData, options);
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

    public cancelJob(jobId: number): Observable<any> {
        const options = {
            params: { jobId: jobId.toString() }
        };

        return this.vglRequest('secure/killJob.do', options);
    }

    public duplicateJob(jobId: number, files: string[]): Observable<any> {
        const options = {
            params: {
                jobId: jobId.toString(),
                files: files.join(',')
            }
        };

        return this.vglRequest('secure/duplicateJob.do', options);
    }

    public updateOrCreateJob(name: string, description: string, seriesId: number,
        computeServiceId, string, computeVmId: string,
        computeVmRunCommand: string, computeTypeId: string, ncpus: number,
        jobfs: number, mem: number, registeredUrl: string,
        emailNotification: boolean, walltime: number): Observable<any> {
        let httpParams: HttpParams = new HttpParams();

        for (let arg in arguments) {
            //params.set(arg.toString(), )
        }
        /*
        if (name)
            params.set('name', name);
        if(description)
            params.set('description', description);
        if(seriesId)
            params.set('seriesId', seriesId);
        if(computeServiceId)
            params.set('', );
        if(computeVmId)
            params.set('', );
        if(computeVmRunCommand)
            params.set('', );
        if(computeTypeId)
            params.set('', );
        if(ncpus)
            params.set('', );
        if(jobfs)
            params.set('', );
        if(mem)
            params.set('', );
        if(registeredUrl)
            params.set('', );
        if(emailNotification)
            params.set('', );
        if(walltime)
            params.set('', );
        */
        return this.vglRequest('secure/updateOrCreateJob.do', { params: httpParams });
    }

    public submitJob(jobId: number): Observable<any> {
        const options = {
            params: { jobId: jobId.toString() }
        };

        return this.vglRequest('secure/submitJob.do', options);
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
        }
        return this.vglRequest('makeErddapUrl.do', options);
    }

    public makeWfsUrl(dlOptions: DownloadOptions): Observable<JobDownload> {
        const options = {
            params: dlOptions
        }
        return this.vglRequest('makeWfsUrl.do', options);
    }

    public makeNetcdfsubseserviceUrl(dlOptions: DownloadOptions): Observable<JobDownload> {
        const options = {
            params: dlOptions
        }
        return this.vglRequest('makeNetcdfsubseserviceUrl.do', options);
    }

    public makeDownloadUrl(dlOptions: DownloadOptions): Observable<JobDownload> {
        const options = {
            params: dlOptions
        }
        return this.vglRequest('makeDownloadUrl.do', options);
    }

    public getRequestedOutputFormats(serviceUrl: string): Observable<any> {
        const options = {
            params: { serviceUrl: serviceUrl }
        }
        return this.vglRequest('getFeatureRequestOutputFormats.do', options);
    }

    public getEntry<T>(url: string): Observable<T> {
        return url ? this.http.get<T>(url) : Observable.empty();
    }

    public getSolution(url: string): Observable<Solution> {
        return this.getEntry<Solution>(url);
    }

    // Add to database dataset information that is bookmarked    
    public addBookMark(fileIdentifier: string, serviceId: string) : Observable<number> {
        const options = {
            params: {
                fileIdentifier: fileIdentifier,
                serviceId: serviceId
            }
        };
        return this.vglRequest('addBookMark.do', options);
    }

    //remove book mark information from database
    public removeBookMark(id : number) {
        const options = {
            params: {
                id: id.toString()
            }
        };
        return this.vglRequest('deleteBookMark.do', options);
    }

    //get list of bookmarks for a user
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
        }
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

    //gets csw record information based on fileter parameters such as file identifier and service id 
    public getFilteredCSWRecord(fileIdentifier: string, serviceId: string): Observable<CSWRecordModel[]> {
        const options = {
            params: {
                fileIdentifier: fileIdentifier,
                serviceId: serviceId
            }
        };
        return this.vglRequest('getCSWRecord.do', options);
    }

    //gets registry information to be used in faceted search and bookmarking of a dataset
    public getAvailableRegistries(): Observable<any> {
        return this.vglRequest('getFacetedCSWServices.do');
    }

}
