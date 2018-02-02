
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

import { CSWRecordModel } from './../modules/portal-core-ui/model/data/cswrecord.model';


@Injectable()
export class CSWSearchService {

    constructor(private httpClient: HttpClient, @Inject('env') private env) {
        //this.getFacetedSearch(null, 10, null, null, null, null, null);
    }


    /**
     * Returns an array of keywords for specified service IDs
     * @param serviceIds an array of service IDs
     */
    getFacetedKeywords(serviceIDs: string[]): Observable<string[]> {
        let httpParams = new HttpParams();
        serviceIDs.forEach(id => {
            //httpParams = httpParams.append('serviceId[]', id);
            httpParams = httpParams.append('serviceId', id);
        });
        console.log(httpParams.toString());
        return this.httpClient.post(this.env.portalBaseUrl + 'facetedKeywords.do', httpParams.toString(), {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
            responseType: 'json'
        }).map(response => {
            return response['data'];
        });
    }


    /**
     * TODO: Map to specific object
     */
    getFacetedSearch(starts: number[], limit: number, serviceIds: string[],
                     rawFields: string[], rawValues: string[],
                     rawTypes: string[], rawComparisons: string[]): any {
        let httpParams = new HttpParams();
        if(limit) {
            httpParams = httpParams.append('limit', limit.toString());
        }
        if(starts) {
            starts.forEach(s => {
                httpParams = httpParams.append('starts', s.toString());
            });
        }
        if(serviceIds) {
            serviceIds.forEach(id => {
                httpParams = httpParams.append('serviceIds', id);
            });
        }
        if(rawFields) {
            rawFields.forEach(f => {
                httpParams = httpParams.append('rawFields', f);
            });
        }
        if(rawValues) {
            rawValues.forEach(v => {
                httpParams = httpParams.append('rawValues', v);
            });
        }
        if(rawTypes) {
            rawTypes.forEach(t => {
                httpParams = httpParams.append('rawTypes', t);
            });
        }
        if(rawComparisons) {
            rawComparisons.forEach(c => {
                httpParams = httpParams.append('rawComparisons', c);
            });
        }
        return this.httpClient.post(this.env.portalBaseUrl + 'facetedCSWSearch.do', httpParams.toString(), {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
            responseType: 'json'
        }).map(response => {
            return response['data'];
        });
    }

}