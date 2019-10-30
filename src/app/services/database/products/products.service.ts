import { Injectable } from '@angular/core';
import { DbService } from '../_base/db.service';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private table = 'products';

  constructor(private db: DbService) {}

  use() {
    this.db.use(this.table);
  }

  async select(
    isPublic: boolean = null,
    withTrashed: boolean = false
  ): Promise<Product[]> {
    this.use();
    let query: string = null;
    if (isPublic === true) {
      query = `is_public = 1`;
    } else if (isPublic === false) {
      query = `is_public = 0`;
    }
    return this.db.select<Product>(query, withTrashed);
  }

  async find(name: string): Promise<Product> {
    this.use();
    return this.db.findByName<Product>(name);
  }

  async insert(product: Product, fromRemote: boolean = false): Promise<void> {
    this.use();
    this.db.insert(product, !fromRemote);
  }

  async update(originalName: string, product: Product, fromRemote: boolean = false): Promise<void> {
    this.use();
    this.db.updateBy('name', originalName, product, !fromRemote);
  }

  async delete(name: string): Promise<void> {
    this.use();
    this.db.deleteBy('name', name);
  }

  async forceDelete(name: string): Promise<void> {
    this.use();
    this.db.forceDeleteBy('name', name);
  }
}
