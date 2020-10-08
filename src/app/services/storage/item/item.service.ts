import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ObjectsStorageService } from '../objects-storage.service';
import { Item } from './item';

@Injectable({
  providedIn: 'root'
})
export class ItemService extends ObjectsStorageService {
  private key = 'items';

  constructor(protected storage: Storage) {
    super(storage);
  }

  public async find(id: number | string): Promise<Item> {
    const payload = { p: 'id', v: id };
    return await super.findBy(this.key, payload);
  }

  public async searchByProduct(
    shoppingListId: number | string,
    product: string
  ): Promise<Item[]> {
    const payload = { p: 'product_name', v: product };
    const items = await this.searchBy(this.key, payload);
    return items.filter(item => item.shopping_list_id === shoppingListId);
  }

  public async searchByShoppingList(
    shoppingListId: number | string
  ): Promise<Item[]> {
    const payload = { p: 'shopping_list_id', v: shoppingListId };
    return await this.searchBy(this.key, payload);
  }

  public async get(withTrashed = false): Promise<Item[]> {
    return await super.get(this.key, withTrashed);
  }

  public async set(items: Item[]): Promise<Item[]> {
    return await super.set(this.key, items);
  }

  public async update(item: Item, changes: Item): Promise<Item[]> {
    const payload = { p: 'id', v: item.id };
    return await super.update(this.key, changes, payload);
  }

  public async updateWithoutTimestamp(
    item: Item,
    changes: Item
  ): Promise<Item[]> {
    const payload = { p: 'id', v: item.id };
    return await super.update(this.key, changes, payload, false);
  }

  public async push(item: Item): Promise<Item[]> {
    return await super.push(this.key, item);
  }

  public async remove(item: Item, force = false): Promise<void> {
    const payload = { p: 'id', v: item.id };
    return await this.removeObject(this.key, payload, force);
  }

  public async batchRemove(items: Item[], force = false): Promise<void> {
    for (const item of items) {
      const payload = { p: 'id', v: item.id };
      await this.removeObject(this.key, payload, force);
    }
  }
}
