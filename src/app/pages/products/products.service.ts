import { Injectable } from '@angular/core';

import { SyncService } from './sync.service';
import { ProductsService as DbProductService } from '../../services/database/products/products.service';
import { Product } from 'src/app/services/database/products/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(
    private syncService: SyncService,
    private dbProduct: DbProductService
  ) {}

  async index(forceSync: boolean = false): Promise<Product[]> {
    await this.syncService.sync(forceSync);
    return this.dbProduct.select();
  }

  async insert(name: string): Promise<void> {
    const product: Product = {
      id: null,
      name,
      is_public: false,
      created_at: null,
      updated_at: null,
      deleted_at: null
    };
    await this.dbProduct.insert(product);
    await this.syncService.sync(true);
  }

  async destroy(name: string): Promise<void> {
    await this.dbProduct.deleteBy('name', name);
    await this.syncService.sync();
  }
}
