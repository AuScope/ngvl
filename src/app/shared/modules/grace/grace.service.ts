import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class GraceService {

    constructor(private http: HttpClient) {}

    public getGraceTimeSeriesDataForParameter(parameter: string, x: number, y: number): Observable<any> {
        return this.http.get(environment.grace.host + "/parameter/" + parameter + "/" + x + "/" + y);
    }

    public getGraceAllTimeSeriesData(x: number, y: number): Observable<any> {
        return this.http.get(environment.grace.host + "/all/coord/" + x + "/" + y);
    }

    private coordinateListToQueryString(coordinateList: string[]): string {
        let coordinateQueryString = "p=";
        for (let i = 0; i < coordinateList.length; i++) {
            coordinateQueryString += coordinateList[i];
            if (i !== coordinateList.length - 1) {
                coordinateQueryString += "&p=";
            }
        }
        return coordinateQueryString;
    }

    public getGraceAllTimeSeriesDataForPolygon(coordinateList: any[]): Observable<any> {
        const coordinateQueryList: string = this.coordinateListToQueryString(coordinateList);
        return this.http.get(environment.grace.host + "/all/poly?" + coordinateQueryList);
    }

    public getGraceAllTimeSeriesDataForDrainageBasin(basin: string): Observable<any> {
        // TODO: Encode? Will depend on basin IDs, not currently needed
        return this.http.get(environment.grace.host + "/all/basin/" + basin);
    }

    public getGraceDates(): Observable<any> {
        return this.http.get(environment.grace.host + "/dates");
    }

    public createAnimation(animationOptions: any) {
        return this.http.post(environment.grace.host + "/video/", animationOptions, {
            responseType: 'blob' as 'json'
        });
    }

    public getDrainageBasins(): Observable<any> {
        return this.http.get(environment.grace.host + "/drainage_basins/");
    }

}
