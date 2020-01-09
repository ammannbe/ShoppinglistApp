import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { DbService } from '../_base/db.service';
import { QueriesService } from '../_base/queries.service';
import { Item } from './item';

@Injectable({
  providedIn: 'root'
})
export class ItemsService extends DbService {
  protected table = 'items';

  constructor(protected sqlite: SQLite, protected queries: QueriesService) {
    super(sqlite, queries);
  }

  public async select<Item = any>(
    where?: { shopping_list_id: number },
    withTrashed: boolean = false
  ): Promise<Item[]> {
    return super.select<Item>(where, withTrashed);
  }

  public async find<Item = any>(id: number): Promise<Item> {
    return super.find<Item>(id);
  }

  public async findByRemoteId<Item = any>(id: number): Promise<Item> {
    return super.findByRemoteId<Item>(id);
  }

  public async insert(item: Item): Promise<void> {
    super.insert(item, !this.resourceIsRemote(item));
  }

  public async update(id: number, item: Item): Promise<void> {
    super.update(id, item, !this.resourceIsRemote(item));
  }
}
