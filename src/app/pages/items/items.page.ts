import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { ShoppingListsService } from '../shopping-lists/shopping-lists.service';
import { ItemsService } from './items.service';
import { Item } from 'src/app/services/database/items/item';
import { ShoppingList } from 'src/app/services/database/shopping-lists/shopping-list';
import { UtilHelperService } from 'src/app/services/util-helper.service';

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
    private itemService: ItemsService,
    private shoppingListService: ShoppingListsService,
    private utilHelper: UtilHelperService,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController
  ) {
    setTimeout(() => {
      this.activatedRoute.paramMap.subscribe(paramMap => {
        if (!paramMap.has('id')) {
          location.href = '/todo-lists';
          return;
        }
        this.shoppingListService
          .find(+paramMap.get('id'))
          .then(shoppingList => {
            this.shoppingList = shoppingList;
            this.load();
          })
          .catch(e => {
            alert('error ' + JSON.stringify(e));
          });
      });
    }, 200);
  }

  ngOnInit() {}

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
    if (this.slidingItem !== null) {
      this.slidingItem.close();
      this.slidingItem = null;
    }
  }

  load(forceSync: boolean = false) {
    this.itemService.index(this.shoppingList, forceSync).then(items => {
      if (!items.length) {
        this.hasItems = false;
      }
      this.itemsDone = [];
      this.itemsUndone = [];
      items.forEach(item => {
        if (item.done) {
          this.itemsDone.push(item);
        } else {
          this.itemsUndone.push(item);
        }
      });
      this.itemsDone = this.utilHelper.sortBy('product_name', this.itemsDone);
      this.itemsUndone = this.utilHelper.sortBy(
        'product_name',
        this.itemsUndone
      );

      this.unhighlightItem();
    });
  }

  reload($event: any = null, forceSync: boolean = false) {
    this.load(forceSync);
    this.closeSlidingItemIfOpen();
    if ($event) {
      $event.target.complete();
    }
  }

  done(item: Item) {
    if (this.slidingItem) {
      return false;
    }
    if (this.keyboardIsVisible) {
      return false;
    }
    item.done = true;
    this.highlightItem(item);
    this.itemService.update(item.id, this.shoppingList, item).then(() => {
      this.reload();
    });
  }

  undone(item: Item) {
    if (this.slidingItem) {
      return false;
    }
    if (this.keyboardIsVisible) {
      return false;
    }
    item.done = false;
    this.highlightItem(item);
    this.itemService.update(item.id, this.shoppingList, item).then(() => {
      this.reload();
    });
  }

  async remove(item: Item | Item[]): Promise<void> {
    this.closeSlidingItemIfOpen();

    let items: Item[];
    if (item instanceof Array) {
      items = item;
    } else {
      items = [item];
    }

    if (items.length > 1) {
      if (!(await this.removeConfirmation(items))) {
        return;
      }
    }

    for (const item of items) {
      await this.itemService.destroy(this.shoppingList, item);
    }

    this.reload();
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
            handler: () => {
              return resolve(false);
            }
          },
          {
            text: 'Ja',
            handler: () => {
              return resolve(true);
            }
          }
        ]
      });
      await alert.present();
    });
  }

  private highlightItem(item: Item) {
    this.highlight = item;
  }

  private unhighlightItem() {
    this.highlight = null;
  }
}
