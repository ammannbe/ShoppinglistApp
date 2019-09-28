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

  async select(): Promise<ShoppingList[]> {
    this.use();
    return this.db.select<ShoppingList[]>();
  }

  async find(id: number): Promise<ShoppingList> {
    this.use();
    return this.db.find<ShoppingList>(id);
  }

  async insert(name: string) {
    this.use();
    this.db.insert('name', `"${name}"`);
  }

  async update(id: number, name: string) {
    this.use();
    this.db.update(id, `name="${name}"`);
  }

  async delete(id: number) {
    this.use();
    this.db.delete(id);
  }
}
