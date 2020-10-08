import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { TokenService } from '../storage/token/token.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public HOST = 'https://shoppinglist-api.narrenhaus.ch/api';

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  async checkConnection(): Promise<boolean> {
    const response = await this.http
      .get(this.HOST + '/im-a-teapot')
      .toPromise()
      .then(data => {
        return data;
      })
      .catch(err => {
        return err;
      });

    return response.status === 418;
  }

  private async queryHeaders(): Promise<HttpHeaders> {
    let headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8'
    });

    const token = await this.tokenService.get();
    if (token) {
      console.log(`HTTP:    Set token in Authorization header: ${token}`);
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async get<T>(url: string): Promise<any> {
    console.log(`HTTP:    GET    ${url}`);
    const options = { headers: await this.queryHeaders() };
    url = `${this.HOST}/${url}`;
    return this.http.get<T>(url, options).toPromise();
  }

  async post<T>(url: string, data: object = {}): Promise<T> {
    console.log(`HTTP:    POST   ${url}`);
    console.log(`      ${JSON.stringify(data)}`);
    const options = { headers: await this.queryHeaders() };
    url = `${this.HOST}/${url}`;
    return this.http.post<T>(url, data, options).toPromise();
  }

  async patch<T>(url: string, data?: object): Promise<T> {
    console.log(`HTTP:    PATCH  ${url}`);
    console.log(`      ${JSON.stringify(data)}`);
    const options = { headers: await this.queryHeaders() };
    url = `${this.HOST}/${url}`;
    return this.http.patch<T>(url, data, options).toPromise();
  }

  async put<T>(url: string, data?: object): Promise<T> {
    console.log(`HTTP:    PUT    ${url}`);
    console.log(`      ${JSON.stringify(data)}`);
    const options = { headers: await this.queryHeaders() };
    url = `${this.HOST}/${url}`;
    return this.http.put<T>(url, data, options).toPromise();
  }

  async delete<T>(url: string): Promise<T> {
    console.log(`HTTP:    DELETE ${url}`);
    const options = { headers: await this.queryHeaders() };
    url = `${this.HOST}/${url}`;
    return this.http.delete<T>(url, options).toPromise();
  }
}
