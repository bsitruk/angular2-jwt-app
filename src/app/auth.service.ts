import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class AuthService {

  constructor(private http: Http) { }

  login(credentials): Promise<void> {
    const url = 'http://localhost:3000/auth';
    return this.http.post(url, credentials)
      .toPromise()
      .then(res => {
        const headers: Headers = res.headers;
        const token = headers.get('Authorization');
        localStorage.setItem('id_token', token);
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
