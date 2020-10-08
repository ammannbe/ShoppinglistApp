import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ObjectsStorageService } from './../objects-storage.service';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends ObjectsStorageService {
  private key = 'products';

  constructor(protected storage: Storage) {
    super(storage);
  }

  public async get(withTrashed = false): Promise<Product[]> {
    return await super.get(this.key, withTrashed);
  }

  public async set(products: Product[]): Promise<Product[]> {
    return await super.set(this.key, products);
  }

  public async push(product: Product): Promise<Product[]> {
    return await super.push(this.key, product);
  }

  public async remove(product: Product, force = false): Promise<void> {
    const payload = { p: 'name', v: product.name };
    return await this.removeObject(this.key, payload, force);
  }
}
