import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { v4 as uuid, validate as validateUuid } from 'uuid';

import { ShoppingListService } from './../../services/storage/shopping-list/shopping-list.service';
import { ShoppingList } from 'src/app/services/storage/shopping-list/shopping-list';

import { ItemService } from './../../services/storage/item/item.service';
import { Item } from 'src/app/services/storage/item/item';
import { ItemSyncService } from 'src/app/services/sync/item/item-sync.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss']
})
export class ItemsPage implements OnInit {
  public showEditInput = false;
  public keyboardIsVisible = false;
  public name = '';
  public shoppingList: ShoppingList;
  public itemsDone: Item[];
  public itemsUndone: Item[];
  public hasItems = true;
  public slidingItem = null;
  public highlight: Item = null;

  constructor(
    private itemService: ItemService,
    private itemSyncService: ItemSyncService,
    private shoppingListService: ShoppingListService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {
    setTimeout(() => {
      this.activatedRoute.paramMap.subscribe(async paramMap => {
        if (!paramMap.has('id')) {
          this.router.navigate(['/shopping-lists']);
          return;
        }

        let id: string | number;
        if (this.isUuid(paramMap.get('id'))) {
          id = paramMap.get('id');
        } else {
          id = +paramMap.get('id');
        }

        this.shoppingList = await this.shoppingListService.find(id);
        this.itemSyncService.setShoppingListId(this.shoppingList.id);
        await this.load(true);

        setInterval(() => this.load(true), 30000);
      });
    }, 500);
  }

  ngOnInit() {}

  public isUuid(value: any) {
    return validateUuid(value);
  }

  itemOnSlide(slidingItem, $event) {
    // ratio > 0 == opening
    // ratio = 1 == opened
    // ratio > 1 == overscroll
    if ($event.detail.ratio >= 1) {
      this.slidingItem = slidingItem;
    } else {
      this.slidingItem = null;
    }
  }

  closeSlidingItemIfOpen() {
    if (!!this.slidingItem) {
      this.slidingItem.close();
      this.slidingItem = null;
    }
  }

  async load(sync = false, onlyPush = false) {
    if (sync) {
      this.itemSyncService.sync(onlyPush);
    }

    this.hasItems = true;
    const done = [];
    const undone = [];

    let items = await this.itemService.get();
    items = items.filter(i => i.shopping_list_id === this.shoppingList.id);
    items = items.sort((a, b) => a.product_name.localeCompare(b.product_name));

    if (!items.length) {
      this.hasItems = false;
    }

    items.forEach(item => {
      if (item.done) {
        done.push(item);
      } else {
        undone.push(item);
      }
    });
    this.itemsDone = done;
    this.itemsUndone = undone;

    this.unhighlightItem();
  }

  async reload(sync = false, onlyPush = false, $event = null) {
    await this.load(sync, onlyPush);
    this.closeSlidingItemIfOpen();

    if ($event) {
      $event.target.complete();
    }
  }

  async done(item: Item) {
    if (!!this.slidingItem) {
      return false;
    }
    if (this.keyboardIsVisible) {
      return false;
    }
    item.done = true;
    this.highlightItem(item);
    await this.itemService.update(item, item);
    this.reload(true, true);
  }

  async undone(item: Item) {
    if (!!this.slidingItem) {
      return false;
    }
    if (this.keyboardIsVisible) {
      return false;
    }
    item.done = false;
    this.highlightItem(item);
    await this.itemService.update(item, item);
    this.reload(true, true);
  }

  private highlightItem(item: Item) {
    this.highlight = item;
  }

  private unhighlightItem() {
    this.highlight = null;
  }

  async remove(item: Item | Item[]): Promise<void> {
    this.closeSlidingItemIfOpen();

    let items: Item[];
    if (item instanceof Array) {
      items = item;
    } else {
      items = [item];
    }

    if (items.length > 1 && !(await this.removeConfirmation(items))) {
      return;
    }

    await this.itemService.batchRemove(items);
    await this.reload(true);
  }

  async removeConfirmation(items: Item[]): Promise<boolean> {
    return new Promise(async resolve => {
      const alert = await this.alertController.create({
        header: `${items.length} Einträge werden gelöscht.`,
        message: `"Möchtest du wirklich ${items.length} Einträge löschen?`,
        buttons: [
          {
            text: 'Nein',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Ja',
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  }

  public edit(item: Item) {
    this.router.navigate(['/items', item.id, 'edit']);
  }
}
