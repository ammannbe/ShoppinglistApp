import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { from } from 'rxjs';

import { TokenService } from '../storage/token/token.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public HOST = 'https://shoppinglist-api.narrenhaus.ch/api';

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  async checkConnection(): Promise<any> {
    return await this.http
      .get(this.HOST + '/im-a-teapot')
      .toPromise()
      .then(data => {
        return data;
      })
      .catch(err => {
        return err;
      });
  }

  private async queryHeaders(): Promise<HttpHeaders> {
    let headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8'
    });

    console.log('HTTP: Query token for header...');
    const token = await this.tokenService.get();
    if (token) {
      console.log(`HTTP: Set token in Authorization header: ${token}`);
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  get<T>(url: string): Observable<any> {
    console.log(`HTTP: GET    ${url}`);
    return from(this.queryHeaders()).pipe(
      switchMap(headers => {
        return this.http.get<T>(this.HOST + url, { headers });
      })
    );
  }

  post<T>(url: string, data: object = {}): Observable<T> {
    console.log(`HTTP: POST   ${url}`);
    console.log(`      ${JSON.stringify(data)}`);
    return from(this.queryHeaders()).pipe(
      switchMap(headers => {
        return this.http.post<T>(this.HOST + url, data, { headers });
      })
    );
  }

  patch<T>(url: string, data?: object): Observable<T> {
    console.log(`HTTP: PATCH  ${url}`);
    console.log(`      ${JSON.stringify(data)}`);
    return from(this.queryHeaders()).pipe(
      switchMap(headers => {
        return this.http.patch<T>(this.HOST + url, data, { headers });
      })
    );
  }

  put<T>(url: string, data?: object): Observable<T> {
    console.log(`HTTP: PUT    ${url}`);
    console.log(`      ${JSON.stringify(data)}`);
    return from(this.queryHeaders()).pipe(
      switchMap(headers => {
        return this.http.put<T>(this.HOST + url, data, { headers });
      })
    );
  }

  delete<T>(url: string): Observable<T> {
    console.log(`HTTP: DELETE ${url}`);
    return from(this.queryHeaders()).pipe(
      switchMap(headers => {
        return this.http.delete<T>(this.HOST + url, { headers });
      })
    );
  }
}
