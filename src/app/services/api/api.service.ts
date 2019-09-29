import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { from } from 'rxjs';

import { AuthService } from './auth.service';
import { Token as LoginToken } from './login/token';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public HOST = 'http://10.0.0.162:8000';
  private token: LoginToken;

  constructor(private http: HttpClient, private auth: AuthService) {}

  async hasConnection(): Promise<any> {
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

  async queryHeaders(): Promise<HttpHeaders> {
    let headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8'
    });

    this.token = await this.auth.queryToken();
    console.log('Queried token for header...');
    if (this.token && this.auth.tokenIsValid()) {
      console.log('...set header...');
      headers = headers.set('Authorization', `Bearer ${this.token.token}`);
    }
    return headers;
  }

  get<T>(url: string): Observable<any> {
    console.log(`HTTP - GET ${url}`);
    return from(this.queryHeaders()).pipe(
      switchMap(headers => {
        return this.http.get<T>(this.HOST + url, { headers });
      })
    );
  }

  post<T>(url: string, data?: object): Observable<T> {
    console.log(`HTTP - POST ${url} - ${JSON.stringify(data)}`);
    return from(this.queryHeaders()).pipe(
      switchMap(headers => {
        return this.http.post<T>(this.HOST + url, data, { headers });
      })
    );
  }

  patch<T>(url: string, data?: object): Observable<T> {
    console.log(`HTTP - PATCH ${url} - ${JSON.stringify(data)}`);
    return from(this.queryHeaders()).pipe(
      switchMap(headers => {
        return this.http.patch<T>(this.HOST + url, data, { headers });
      })
    );
  }

  put<T>(url: string, data?: object): Observable<T> {
    console.log(`HTTP - PUT ${url} - ${JSON.stringify(data)}`);
    return from(this.queryHeaders()).pipe(
      switchMap(headers => {
        return this.http.put<T>(this.HOST + url, data, { headers });
      })
    );
  }

  delete<T>(url: string): Observable<T> {
    console.log(`HTTP - DELETE ${url}`);
    return from(this.queryHeaders()).pipe(
      switchMap(headers => {
        return this.http.delete<T>(this.HOST + url, { headers });
      })
    );
  }
}
