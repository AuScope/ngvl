
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
//import { Observable } from 'rxjs/Observable';
//import 'rxjs/Rx';

import { CSWRecordModel } from './../modules/portal-core-ui/model/data/cswrecord.model';


@Injectable()
export class CSWSearchService {

    constructor(private httpClient: HttpClient, @Inject('env') private env) {}


    /**
     * Returns an array of keywords for specified service IDs
     * @param serviceIds an array of service IDs
     */
    getFacetedKeywords(serviceIDs: string[]): string[] {
        let keywords: string[] = [];

        let httpParams = new HttpParams();
        serviceIDs.forEach(id => {
            //httpParams = httpParams.append('serviceId[]', id);
            httpParams = httpParams.append('serviceId', id);
        });
        console.log(httpParams.toString());
        this.httpClient.post(this.env.portalBaseUrl + 'facetedKeywords.do', httpParams.toString(), {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
            responseType: 'json'
        }).subscribe(response => {
            //this.cswRecords = response['data'].records;
            console.log('Response: ' + response['data']);
        });

        return keywords;
    }


    /**
     * 
     */
    getFacetedSearch(): void {

    }

}