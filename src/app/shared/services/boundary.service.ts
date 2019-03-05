import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import GeoJSON from 'ol/format/geojson';
import Feature from 'ol/Feature';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class BoundaryService {

    constructor(private http: HttpClient) { }

    public getFeatures(url: string): Observable<Feature[]> {
        console.log('getFeatures(), url = ' + url);
        const geojson = new GeoJSON();
        return this.http.get(url).pipe(
            map((json: any) => <Feature[]>geojson.readFeatures(json)),
            catchError(this.handleError<Feature[]>('getFeatures'))
        );
    }

    // example WFS name search url for LGA layer:
    // http://localhost:8080/geoserver/boundaries/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=LGA_2018_AUST
    // &CQL_FILTER=strToLowerCase(LGA_NAME_2018)%20like%20%27co%25%27&COUNT=10&outputformat=application/json
    // &propertyName=LGA_NAME_2018,LGA_CODE_2018&sortBy=LGA_NAME_2018

    // uses the WFS to find features starting with "name"
    public findFeatures(name: string, layer: string, nameAttribute: string): Observable<Feature[]> {
        const url = environment.boundariesUrl + '/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature'
            + '&COUNT=10&outputformat=application/json'
            + '&TYPENAMES=' + layer
            + '&CQL_FILTER=strToLowerCase(' + nameAttribute + ')%20like%20%27' + name.toLowerCase() + '%25%27'
            + '&propertyName=' + nameAttribute
            + '&sortBy=' + nameAttribute;
        console.log('findFeatures(), url = ' + url);
        const geojson = new GeoJSON();
        return this.http.get(url).pipe(
            map((json: any) => <Feature[]>geojson.readFeatures(json)),
            catchError(this.handleError<Feature[]>('getFeatures'))
        );
    }

    public getFeaturesById(id: string, layer: string): Observable<Feature[]> {
        const url = environment.boundariesUrl + '/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature'
            + '&COUNT=1&outputformat=application/json'
            + '&TYPENAMES=' + layer
            + '&FEATUREID=' + id
            + '&srsName=EPSG%3A3857';
        console.log('getFeatureById(), url = ' + url);
        const geojson = new GeoJSON();
        return this.http.get(url).pipe(
            map((json: any) => <Feature[]>geojson.readFeatures(json)),
            catchError(this.handleError<Feature[]>('getFeatureById'))
        );
    }

     private handleError<T>(operation: string, result?: T) {
        return (error: any): Observable<T> => {
            console.error(operation + ' ' + error); // log to console
            return of(result as T);
        };
    }
}
