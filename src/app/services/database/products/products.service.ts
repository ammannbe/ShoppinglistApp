import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { DbService } from '../_base/db.service';
import { QueriesService } from '../_base/queries.service';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService extends DbService {
  protected table = 'products';

  constructor(protected sqlite: SQLite, protected queries: QueriesService) {
    super(sqlite, queries);
  }

  public async select<Product = any>(
    isPublic: boolean = null,
    withTrashed: boolean = false
  ): Promise<Product[]> {
    let query: any = {};
    if (isPublic !== null) {
      query = { is_public: isPublic };
    }
    return super.select<Product>(query, withTrashed);
  }

  public async insert(
    product: Product,
    fromRemote: boolean = false
  ): Promise<void> {
    super.insert(product, !fromRemote);
  }
}
