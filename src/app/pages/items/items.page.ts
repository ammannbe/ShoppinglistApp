import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private itemService: ItemsService,
    private shoppingListService: ShoppingListsService,
    private utilHelper: UtilHelperService,
    private activatedRoute: ActivatedRoute
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
    this.closeSlidingItemIfOpen();
    item.done = true;
    this.itemService.update(item.id, this.shoppingList, item).then(() => {
      this.reload();
    });
  }

  undone(item: Item) {
    this.closeSlidingItemIfOpen();
    item.done = false;
    this.itemService.update(item.id, this.shoppingList, item).then(() => {
      this.reload();
    });
  }

  remove(item: Item) {
    this.closeSlidingItemIfOpen();
    this.itemService.destroy(this.shoppingList, item).then(() => {
      this.reload();
    });
  }
}
