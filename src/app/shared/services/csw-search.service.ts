
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/Rx';

import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';
import { BookMark,Registry,DownloadOptions,JobDownload } from '../../shared/modules/vgl/models';
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

    public addBookMark(fileIdentifier : string, serviceId : string ) : Observable<number> {           
        return this.vgl.addBookMark(fileIdentifier,serviceId);
    }

    public removeBookMark(id : number ) {           
        return this.vgl.removeBookMark(id);
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


    /**
     * Create default download options for a given online resource
     * 
     * @param or 
     * @param cswRecord 
     * @param defaultBbox 
     */
    public createDownloadOptionsForResource(or, cswRecord, defaultBbox): any {
        const dsBounds = cswRecord.geographicElements.length ? cswRecord.geographicElements[0] : null;

        //Set the defaults of our new item
        let downloadOptions: DownloadOptions = {
            name: 'Subset of ' + or.name,
            description: or.description,
            url: or.url,
            method: 'POST',
            localPath: './' + or.name,
            crs: (defaultBbox ? defaultBbox.crs : ''),
            eastBoundLongitude: (defaultBbox ? defaultBbox.eastBoundLongitude : 0),
            northBoundLatitude: (defaultBbox ? defaultBbox.northBoundLatitude : 0),
            southBoundLatitude: (defaultBbox ? defaultBbox.southBoundLatitude : 0),
            westBoundLongitude: (defaultBbox ? defaultBbox.westBoundLongitude : 0),
            dsEastBoundLongitude: (dsBounds ? dsBounds.eastBoundLongitude : null),
            dsNorthBoundLatitude: (dsBounds ? dsBounds.northBoundLatitude : null),
            dsSouthBoundLatitude: (dsBounds ? dsBounds.southBoundLatitude : null),
            dsWestBoundLongitude: (dsBounds ? dsBounds.westBoundLongitude : null),
            format: undefined,
            layerName: undefined,
            coverageName: undefined,
            serviceUrl: undefined,
            srsName: undefined,
            featureType: undefined
        };

        //Add/subtract info based on resource type
        switch (or.type) {
            case 'WCS':
                delete downloadOptions.url;
                delete downloadOptions.serviceUrl;
                delete downloadOptions.srsName;
                delete downloadOptions.featureType;
                downloadOptions.format = 'nc';
                downloadOptions.layerName = or.name;
                downloadOptions.coverageName = downloadOptions.layerName;
                break;
            case 'WFS':
                delete downloadOptions.url;
                delete downloadOptions.format;
                delete downloadOptions.layerName;
                delete downloadOptions.coverageName;
                downloadOptions.serviceUrl = or.url;
                downloadOptions.featureType = or.name;
                downloadOptions.srsName = '';
                break;
            case 'NCSS':
                delete downloadOptions.format;
                delete downloadOptions.serviceUrl;
                delete downloadOptions.srsName;
                delete downloadOptions.featureType;
                downloadOptions.name = or.name;
                downloadOptions.method = 'GET';
                downloadOptions.layerName = or.name;
                downloadOptions.coverageName = downloadOptions.layerName;
                break;
            case 'WWW':
                delete downloadOptions.format;
                delete downloadOptions.srsName;
                break;
            //We don't support EVERY type
            default:
                break;
        }

        return downloadOptions;
    };

    /**
     * 
     * @param onlineResource 
     * @param dlOptions 
     */
    public makeJobDownload(onlineResource: any, cswRecord: CSWRecordModel, dlOptions: DownloadOptions): Observable<JobDownload> {
        switch (onlineResource.type) {
            case 'WCS':
                //Unfortunately ERDDAP requests that extend beyond the spatial bounds of the dataset
                //will fail. To workaround this, we need to crop our selection to the dataset bounds
                if (dlOptions.dsEastBoundLongitude != null && (dlOptions.dsEastBoundLongitude < dlOptions.eastBoundLongitude)) {
                    dlOptions.eastBoundLongitude = dlOptions.dsEastBoundLongitude;
                }
                if (dlOptions.dsWestBoundLongitude != null && (dlOptions.dsWestBoundLongitude > dlOptions.westBoundLongitude)) {
                    dlOptions.westBoundLongitude = dlOptions.dsWestBoundLongitude;
                }
                if (dlOptions.dsNorthBoundLatitude != null && (dlOptions.dsNorthBoundLatitude < dlOptions.northBoundLatitude)) {
                    dlOptions.northBoundLatitude = dlOptions.dsNorthBoundLatitude;
                }
                if (dlOptions.dsSouthBoundLatitude != null && (dlOptions.dsSouthBoundLatitude > dlOptions.southBoundLatitude)) {
                    dlOptions.southBoundLatitude = dlOptions.dsSouthBoundLatitude;
                }
                return this.vgl.makeErddapUrl(dlOptions).map(jobDownload => {
                    jobDownload.cswRecord = cswRecord;
                    jobDownload.onlineResource = onlineResource;
                    return jobDownload;
                });
            case 'WFS':
                return this.vgl.makeWfsUrl(dlOptions).map(jobDownload => {
                    jobDownload.cswRecord = cswRecord;
                    jobDownload.onlineResource = onlineResource;
                    return jobDownload;
                });
            case 'NCSS':
                return this.vgl.makeNetcdfsubseserviceUrl(dlOptions).map(jobDownload => {
                    jobDownload.cswRecord = cswRecord;
                    jobDownload.onlineResource = onlineResource;
                    return jobDownload;
                });
            default:
                return this.vgl.makeDownloadUrl(dlOptions).map(jobDownload => {
                    jobDownload.cswRecord = cswRecord;
                    jobDownload.onlineResource = onlineResource;
                    return jobDownload;
                });
        }
    }


}