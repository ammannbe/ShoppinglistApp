import { Injectable } from '@angular/core';

import { Product } from './../../storage/product/product';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private prefix = 'products';

  constructor(private api: ApiService) {}

  index(): Promise<Product[]> {
    return this.api.get<Product[]>(`${this.prefix}`);
  }

  store(product: Product): Promise<Product> {
    return this.api.post<Product>(this.prefix, product);
  }

  show(id: number): Promise<Product> {
    return this.api.get<Product>(`${this.prefix}/${id}`);
  }

  update(id: number, product: Product): Promise<Product> {
    return this.api.patch<Product>(`${this.prefix}/${id}`, product);
  }

  destroy(id: number) {
    return this.api.delete(`${this.prefix}/${id}`);
  }
}
