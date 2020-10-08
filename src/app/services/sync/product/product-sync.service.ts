import { Injectable } from '@angular/core';
import { SyncService } from '../sync.service';
import { ApiService } from '../../api/api.service';
import { OfflineModeService } from '../../storage/offline-mode/offline-mode.service';
import { ProductService as ApiProductService } from './../../api/product/product.service';
import { ProductService as StorageProductService } from './../../storage/product/product.service';
import { Product } from '../../storage/product/product';

@Injectable({
  providedIn: 'root'
})
export class ProductSyncService extends SyncService {
  constructor(
    protected api: ApiService,
    protected offlineModeService: OfflineModeService,
    private apiProductService: ApiProductService,
    private storageProductService: StorageProductService
  ) {
    super(api, offlineModeService);
  }

  async getLocalItems(): Promise<Product[]> {
    return await this.storageProductService.get(true);
  }

  async storeLocalItem(item: Product): Promise<void> {
    await this.storageProductService.push(item);
  }

  async getRemoteItems(): Promise<Product[]> {
    return await this.apiProductService.index();
  }

  async storeRemoteItem(item: Product): Promise<void> {
    await this.apiProductService.store(item);
  }
}
