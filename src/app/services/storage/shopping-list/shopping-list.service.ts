import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { v4 as uuid, validate as isUuid } from 'uuid';
import { ObjectsStorageService } from '../objects-storage.service';
import { ShoppingList } from './shopping-list';
import { ItemService } from '../item/item.service';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService extends ObjectsStorageService {
  private key = 'shopping-lists';

  constructor(protected storage: Storage, private itemService: ItemService) {
    super(storage);
  }

  public async find(id: number | string): Promise<ShoppingList> {
    const payload = { p: 'id', v: id };
    return await super.findBy(this.key, payload);
  }

  public async get(withTrashed = false): Promise<ShoppingList[]> {
    return await super.get(this.key, withTrashed);
  }

  public async set(shoppingLists: ShoppingList[]): Promise<ShoppingList[]> {
    return await super.set(this.key, shoppingLists);
  }

  public async update(
    shoppingList: ShoppingList,
    changes: ShoppingList
  ): Promise<ShoppingList[]> {
    if (isUuid(shoppingList.id.toString()) && !isUuid(changes.id.toString())) {
      const items = await this.itemService.searchByShoppingList(
        shoppingList.id
      );

      for (const item of items) {
        const newItem = { ...item, shopping_list_id: shoppingList.id };
        await this.itemService.update(item, newItem);
      }
    }

    const payload = { p: 'id', v: shoppingList.id };
    return await super.update(this.key, changes, payload);
  }

  public async updateWithoutTimestamp(
    shoppingList: ShoppingList,
    changes: ShoppingList
  ): Promise<ShoppingList[]> {
    if (isUuid(shoppingList.id.toString()) && !isUuid(changes.id.toString())) {
      const items = await this.itemService.searchByShoppingList(
        shoppingList.id
      );
      for (const item of items) {
        const newItem = { ...item, shopping_list_id: shoppingList.id };
        await this.itemService.updateWithoutTimestamp(item, newItem);
      }
    }

    const payload = { p: 'id', v: shoppingList.id };
    return await super.update(this.key, changes, payload, false);
  }

  public async push(shoppingList: ShoppingList): Promise<ShoppingList[]> {
    return await super.push(this.key, shoppingList);
  }

  public async remove(
    shoppingList: ShoppingList,
    force = false
  ): Promise<void> {
    const payload = { p: 'id', v: shoppingList.id };
    const items = await this.itemService.searchByShoppingList(shoppingList.id);
    items.forEach(item => this.itemService.remove(item, force));
    return await this.removeObject(this.key, payload, force);
  }
}
