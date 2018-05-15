import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { Problem, Problems, User, TreeJobs, Series, CloudFileInformation, DownloadOptions } from './models';

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
        const options = { params: new HttpParams().set('seriesName', folderName).set('seriesDescription', '') };
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
            responseType: 'text'
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

    public getPlaintextPreview(jobId: number, file: string, maxSize: number): Observable<string> {
        const httpParams = new HttpParams().set('jobId', jobId.toString()).set('file', file).set('maxSize', maxSize.toString());
        return this.http.get<VglResponse<string>>(environment.portalBaseUrl + 'secure/getPlaintextPreview.do', {
            params: httpParams
        }).map(vglData)
            .map(preview => preview);
    }

    /*
    public getImagePreview(jobId: number, filename: string): Observable<ImageData> {
      return this.http.get<ImageData>(environment.portalBaseUrl + 'secure/getImagePreview.do');
    }
    */

    public deleteJob(jobId: number): Observable<any> {
        const options = { params: new HttpParams().set('jobId', jobId.toString()) };
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'secure/deleteJob.do', options)
            .map(vglData)
            .map(response => response);
    }

    public deleteSeries(seriesId: number): Observable<any> {
        const options = { params: new HttpParams().set('seriesId', seriesId.toString()) };
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'secure/deleteSeriesJobs.do', options)
            .map(vglData)
            .map(response => response);
    }

    public cancelJob(jobId: number): Observable<any> {
        const options = { params: new HttpParams().set('jobId', jobId.toString()) };
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'secure/killJob.do', options)
            .map(vglData)
            .map(response => response);
    }

    public duplicateJob(jobId: number, files: string[]): Observable<any> {
        const options = { params: new HttpParams().set('jobId', jobId.toString()).set('files', files.join(',')) };
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'secure/duplicateJob.do', options)
            .map(vglData)
            .map(response => response);
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
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'secure/updateOrCreateJob.do', { params: httpParams })
            .map(vglData)
            .map(response => response);

    }

    public submitJob(jobId: number): Observable<any> {
        const options = { params: new HttpParams().set('jobId', jobId.toString()) };
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'secure/submitJob.do', options)
            .map(vglData)
            .map(response => response);
    }

    public getAuditLogs(jobId: number): Observable<any> {
        const options = { params: new HttpParams().set('jobId', jobId.toString()) };
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'secure/getAuditLogsForJob.do', options)
            .map(vglData)
            .map(response => response);
    }

    /**
     * Create a list of HTTP parameters by parsing URL string, e.g:
     * http://someaddress.com?first_parameter=value1&second_parameters=value2
     * 
     * @param url 
     */
    private createHttpParamsFromUrl(url: string): HttpParams {
        let httpParams: HttpParams = new HttpParams();
        const urlParameters: string[] = url.split('?');
        if (urlParameters.length == 2) {
            for (let keyValuePair in urlParameters[1].split('&')) {
                httpParams.set(keyValuePair.split('=')[0], keyValuePair.split('=')[1]);
            }
        }
        return httpParams;
    }

    /**
     * Create a list of HTTP parameters from the key/value pairs of a JSON
     * object
     * 
     * @param jsonObject 
     */
    private createHttpParamsFromJsonObject(jsonObject: any): HttpParams {
        let httpParams = new HttpParams();
        for (let param in jsonObject) {
            httpParams = httpParams.set(param, jsonObject[param]);
        }
        return httpParams;
    }

    public makeErddapUrl(dlOptions: DownloadOptions): Observable<any> {
        const httpParams = this.createHttpParamsFromJsonObject(dlOptions);
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'makeErddapUrl.do', { params: httpParams })
            .map(vglData)
            .map(response => response);
    }

    public makeWfsUrl(dlOptions: DownloadOptions): Observable<any> {
        const httpParams = this.createHttpParamsFromJsonObject(dlOptions);
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'makeWfsUrl.do', { params: httpParams })
            .map(vglData)
            .map(response => response);
    }

    public makeNetcdfsubseserviceUrl(dlOptions: DownloadOptions): Observable<any> {
        const httpParams = this.createHttpParamsFromJsonObject(dlOptions);
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'makeNetcdfsubseserviceUrl.do', { params: httpParams })
            .map(vglData)
            .map(response => response);
    }

    public makeDownloadUrl(dlOptions: DownloadOptions): Observable<any> {
        const httpParams = this.createHttpParamsFromJsonObject(dlOptions);
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'makeDownloadUrl.do', { params: httpParams })
            .map(vglData)
            .map(response => response);
    }

    private dlTest(data: Response) {
        var blob = new Blob([data], { type: 'text/csv' });
        var url= window.URL.createObjectURL(blob);
        window.open(url);
    }

    public downloadDataset(downloadUrl: string): Observable<any> {
        //var url= window.URL.createObjectURL(blob);
        window.open(downloadUrl);
        /*
        const httpParams: HttpParams = this.createHttpParamsFromUrl(downloadUrl);
        downloadUrl = downloadUrl.split('?')[0];
        return this.http.get(downloadUrl, {
            params: httpParams,
            responseType: 'blob'
        }).map((response) => {
            //return response;
            response => this.dlTest(response);
        }).catch((error: Response) => {
            return Observable.throw(error);
        });
        */
    }

}
