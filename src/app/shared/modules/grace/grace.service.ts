import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraceStyleSettings } from './grace-graph.models';

@Injectable()
export class GraceService {

    private _graceStyleSettings: BehaviorSubject<GraceStyleSettings> = new BehaviorSubject({
        minColor: '#ff0000',
        minValue: -1,
        neutralColor: '#ffffff',
        neutralValue: 0,
        maxColor: '#0000ff',
        maxValue: 1,
        transparentNeutralColor: false
    });
    public readonly graceStyleSettings: Observable<GraceStyleSettings> = this._graceStyleSettings.asObservable();
    private _graceDate: BehaviorSubject<any> = new BehaviorSubject({ undefined });
    public readonly graceDate: Observable<Date> = this._graceDate.asObservable();

    constructor(private http: HttpClient) {
        this.getGraceDates().subscribe(dates => {
            this._graceDate.next(dates[0]);
        });
    }

    public getGraceTimeSeriesDataForPoint(x: number, y: number): Observable<any> {
        return this.http.get(environment.grace.host + "/graph/coord/" + x + "/" + y);
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

    public getGraceTimeSeriesDataForPolygon(coordinateList: any[]): Observable<any> {
        const coordinateQueryList: string = this.coordinateListToQueryString(coordinateList);
        return this.http.get(environment.grace.host + "/graph/poly?" + coordinateQueryList);
    }

    public getGraceDates(): Observable<Date[]> {
        return this.http.get<Date[]>(environment.grace.host + "/dates");
    }

    public setGraceDate(d: Date) {
        this._graceDate.next(d);
    }

    public createAnimation(animationOptions: any) {
        return this.http.post(environment.grace.host + "/video/", animationOptions, {
            responseType: 'blob' as 'json'
        });
    }

    public setGraceStyleSettings(graceStyleSettings: GraceStyleSettings) {//: Observable<ViewType> {
        this._graceStyleSettings.next(graceStyleSettings);
    }
  
}
