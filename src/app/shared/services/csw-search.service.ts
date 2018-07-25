
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/Rx';

import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { BookMark,Registry,DownloadOptions } from '../../shared/modules/vgl/models';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { UserStateService } from './user-state.service';

@Injectable()
export class CSWSearchService {

    constructor(private httpClient: HttpClient, @Inject('env') private env,
                private vgl: VglService, private userStateService: UserStateService) { }

    private _registries: BehaviorSubject<Registry[]> = new BehaviorSubject([]);
    public readonly registries: Observable<Registry[]> = this._registries.asObservable();

    /**
     * Returns an array of keywords for specified service IDs
     * @param serviceIds an array of service IDs
     */
    public getFacetedKeywords(serviceIDs: string[]): Observable<string[]> {
        let httpParams = new HttpParams();
        serviceIDs.forEach(id => {
            httpParams = httpParams.append('serviceId', id);
        });
        return this.httpClient.post(this.env.portalBaseUrl + 'facetedKeywords.do', httpParams.toString(), {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
            responseType: 'json'
        }).map(response => {
            return response['data'];
        });
    }


    /**
     * 
     * @param start 
     * @param limit 
     * @param serviceId 
     * @param field 
     * @param value 
     * @param type 
     * @param comparison 
     */
    public getFacetedSearch(start: number[], limit: number, serviceId: string[],
        field: string[], value: string[],
        type: string[], comparison: string[]): Observable<any> {

        let httpParams = new HttpParams();
        if(limit) {
            httpParams = httpParams.append('limit', limit.toString());
        }
        if(start) {
            start.forEach(s => {
                httpParams = httpParams.append('start', s.toString());
            });
        }
        if(serviceId) {
            serviceId.forEach(id => {
                httpParams = httpParams.append('serviceId', id);
            });
        }
        if(field) {
            field.forEach(f => {
                httpParams = httpParams.append('field', f);
            });
        }
        if(value) {
            value.forEach(v => {
                httpParams = httpParams.append('value', v);
            });
        }
        if(type) {
            type.forEach(t => {
                httpParams = httpParams.append('type', t);
            });
        }
        if(comparison) {
            comparison.forEach(c => {
                httpParams = httpParams.append('comparison', c);
            });
        }
        return this.httpClient.post(this.env.portalBaseUrl + 'facetedCSWSearch.do', httpParams.toString(), {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
            responseType: 'json'
        }).map(response => {
            //return response['data'].records;
            return response['data'];
        });
    } 
       
    /**
     * executes getFacetedCSWServices.do in vgl service 
     */
    public updateRegistries() : Observable<Registry[]> {  
       let obs = this.vgl.getAvailableRegistries();
       obs.subscribe(registryList => this._registries.next(registryList));
       return obs;
    }

    /**
     * Get the service id information of the cswrecord by matching the record info(cswrecord.recordInfoUrl) with available registries.
     */

    public getServiceId(cswRecord: CSWRecordModel): string {
        let availableRegistries: Registry[] = [];
        let serviceId: string = "";             
        this.registries.subscribe(data => {
            availableRegistries = data;
            for (let registry of availableRegistries) {
                var matchingUrl = registry.url.substring(registry.url.lastIndexOf('//') + 2, registry.url.lastIndexOf('csw'));
                if (cswRecord.recordInfoUrl.indexOf(matchingUrl) != -1) {
                    serviceId = registry.id;
                    break;
                }
            }
        });
        return serviceId; 
    }

    public getFilteredCSWRecord(fileIdentifier : string, serviceId : string): Observable<CSWRecordModel[]> {         
        return this.vgl.getFilteredCSWRecord(fileIdentifier,serviceId);
    }

    public getBookMarks(): Observable <BookMark[]> {       
        return this.vgl.getBookMarks();
    }

    public addBookMark(fileIdentifier : string, serviceId : string ) {           
        return this.vgl.addBookMark(fileIdentifier,serviceId);
    }

    public removeBookMark(fileIdentifier : string, serviceId : string ) {           
        return this.vgl.removeBookMark(fileIdentifier,serviceId);
    }

    /**
     * checks if a csw record has been bookmarked by the user
     * @param cswRecord 
     */
    public isBookMark(cswRecord: CSWRecordModel) : boolean {
        let bookMarkList: BookMark[] = [];
        let match: boolean = false;        
        let serviceId: string = this.getServiceId(cswRecord);
        let fileIdentifier: string = cswRecord.id;
        this.userStateService.bookmarks.subscribe(data => {
            bookMarkList = data;
            bookMarkList.some(bookMark => {
                match = ((fileIdentifier.indexOf(bookMark.fileIdentifier) >= 0) && (serviceId.indexOf(bookMark.serviceId) >= 0));                
                return match;
            }); 
        });        
        return match;
    }   

    /**
     * Gets the book mark id information for a csw record.  
     * This is made use of while storing multiple sets of download options as bookmarks for a particular dataset that has been bookmarked
     * @param cswRecord 
     */
    public getBookMarkId(cswRecord: CSWRecordModel) : number {
        let serviceId: string = this.getServiceId(cswRecord);
        let fileIdentifier: string = cswRecord.id;
        let bookMarkId: number;
        this.userStateService.bookmarks.subscribe(data => {
            data.forEach(bookMark => {
                if ((bookMark.fileIdentifier.indexOf(fileIdentifier) === 0) && (bookMark.serviceId.indexOf(serviceId) === 0))
                    bookMarkId = bookMark.id;
            });
        }, error => {
            console.log(error.message);
        });
        return bookMarkId;
    }

}