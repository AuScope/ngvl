
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

import { CSWRecordModel } from './../modules/portal-core-ui/model/data/cswrecord.model';


@Injectable()
export class CSWSearchService {

    constructor(private httpClient: HttpClient, @Inject('env') private env) {
        /* TEST
        this.getFacetedSearch(null, 10, ['cswNCI'], null, null, null, null)
            .subscribe(data => {
                console.log(data);
            },
            error => {
                console.log("CSW Search Error: " + error.message);
            });
        */
    }


    /**
     * Returns an array of keywords for specified service IDs
     * @param serviceIds an array of service IDs
     */
    getFacetedKeywords(serviceIDs: string[]): Observable<string[]> {
        let httpParams = new HttpParams();
        serviceIDs.forEach(id => {
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
     * 
     * @param start 
     * @param limit 
     * @param serviceId 
     * @param field 
     * @param value 
     * @param type 
     * @param comparison 
     */
    getFacetedSearch(start: number[], limit: number, serviceId: string[],
        field: string[], value: string[],
        type: string[], comparison: string[]): Observable<CSWRecordModel[]> {

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
            return response['data'].records;
        });
    }

}