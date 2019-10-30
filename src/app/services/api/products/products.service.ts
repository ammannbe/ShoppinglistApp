import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api.service';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private prefix = '/products';

  constructor(private api: ApiService) {}

  index(): Observable<Product[]> {
    return this.api.get<Product[]>(`${this.prefix}`);
  }

  store(product: Product): Observable<Product> {
    return this.api.post<Product>(this.prefix, product);
  }

  show(id: number): Observable<Product> {
    return this.api.get<Product>(`${this.prefix}/${id}`);
  }

  update(id: number, product: Product): Observable<Product> {
    return this.api.patch<Product>(`${this.prefix}/${id}`, product);
  }

  destroy(id: number) {
    return this.api.delete(`${this.prefix}/${id}`);
  }
}
