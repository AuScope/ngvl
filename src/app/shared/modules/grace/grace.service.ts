import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class GraceService {

    constructor(private http: HttpClient) {}

    public getTimeSeriesData(parameter: string, x: number, y: number): Observable<any> {
        return this.http.get(environment.graceHost + "/" + parameter + "/" + x + "/" + y);
    }
}
