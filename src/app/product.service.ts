import { Injectable } from '@angular/core';
import { AuthHttp } from 'angular2-jwt';

import { Product } from './product';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProductService {

  constructor(private authHttp: AuthHttp) { }

  getProducts(): Promise<Product[]> {
    const url = 'http://localhost:3000/products';
    return this.authHttp.get(url)
      .toPromise()
      .then(res => res.json().products as Product[])
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
