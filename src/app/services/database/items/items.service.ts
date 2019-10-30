import { Injectable } from '@angular/core';
import { DbService } from '../_base/db.service';
import { Item } from './item';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private table = 'items';

  constructor(private db: DbService) {}

  use() {
    this.db.use(this.table);
  }

  private isRemote(item: Item) {
    return item.remote_id === null ? false : true;
  }

  async select(
    shoppingListId: number,
    withTrashed: boolean = false
  ): Promise<Item[]> {
    this.use();
    return this.db.select<Item>(
      `shopping_list_id = "${shoppingListId}"`,
      withTrashed
    );
  }

  async find(id: number): Promise<Item> {
    this.use();
    return this.db.find<Item>(id);
  }

  async findByRemoteId(id: number): Promise<Item> {
    this.use();
    return this.db.findByRemoteId<Item>(id);
  }

  async insert(item: Item): Promise<void> {
    this.use();
    this.db.insert(item, !this.isRemote(item));
  }

  async update(id: number, item: Item): Promise<void> {
    this.use();
    this.db.update(id, item, !this.isRemote(item));
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
