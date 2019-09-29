import { Injectable } from '@angular/core';

import { DbService } from '../_base/db.service';
import { ShoppingList } from 'src/app/pages/shopping-lists/shopping-list';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListsService {
  private table = 'shopping_lists';

  constructor(private db: DbService) {}

  use() {
    this.db.use(this.table);
  }

  async select(withTrashed: boolean = false): Promise<ShoppingList[]> {
    this.use();
    return this.db.select<ShoppingList>(null, withTrashed);
  }

  async find(id: number): Promise<ShoppingList> {
    this.use();
    return this.db.find<ShoppingList>(id);
  }

  findByRemoteId(id: number): Promise<ShoppingList> {
    this.use();
    return this.db.findByRemoteId<ShoppingList>(id);
  }

  async insert(name: string, remoteId?: number): Promise<void> {
    this.use();
    let values = `"${name}"`;
    let columns = 'name';
    if (remoteId) {
      columns += ', remote_id';
      values += `, "${remoteId}"`;
    }
    this.db.insert(columns, values);
  }

  async update(id: number, name: string, remote?: ShoppingList): Promise<void> {
    this.use();
    let set = `name="${name}"`;
    if (remote) {
      set +=
        `, remote_id="${remote.id}",` +
        `updated_at="${remote.updated_at}",` +
        `created_at="${remote.created_at}"`;
    }
    this.db.updateRaw(id, set);
  }

  async delete(id: number): Promise<void> {
    this.use();
    this.db.delete(id);
  }

  async forceDelete(id: number): Promise<void> {
    this.use();
    this.db.forceDelete(id);
  }
}
