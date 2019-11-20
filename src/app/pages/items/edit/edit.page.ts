import { Component, OnInit, ViewChild } from '@angular/core';

import { ItemsService } from '../items.service';
import { ActivatedRoute } from '@angular/router';
import { ShoppingListsService } from '../../shopping-lists/shopping-lists.service';
import { ShoppingList } from 'src/app/services/database/shopping-lists/shopping-list';
import { Item } from 'src/app/services/database/items/item';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ProductsService } from '../../products/products.service';
import { Product } from '../../products/product';
import { UtilHelperService } from 'src/app/services/util-helper.service';
import { IonInput } from '@ionic/angular';
import { UnitsService } from '../../units/units.service';
import { Unit } from 'src/app/services/database/units/unit';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss']
})
export class EditPage implements OnInit {
  @ViewChild('autofocus', { static: false }) ionInput: IonInput;

  public products: Product[];
  public productsSearch: Product[];
  public shoppingList: ShoppingList;
  public amount: number = null;
  public unit: string = null;
  public product: string = null;
  public item: Item;
  public units: Unit[];

  constructor(
    private itemService: ItemsService,
    private unitService: UnitsService,
    private activatedRoute: ActivatedRoute,
    private shoppingListService: ShoppingListsService,
    private productService: ProductsService,
    private toast: ToastService,
    private utilHelper: UtilHelperService
  ) {
    setTimeout(() => {
      this.activatedRoute.paramMap.subscribe(paramMap => {
        if (!paramMap.has('id')) {
          location.href = '/todo-lists';
          return;
        }
        this.itemService.find(+paramMap.get('id')).then(item => {
          this.item = item;
          this.amount = this.item.amount;
          this.unit = this.item.unit_name;
          this.product = this.item.product_name;

          this.shoppingListService
            .find(item.shopping_list_id)
            .then(shoppingList => {
              this.shoppingList = shoppingList;
              this.load();
            });
        });
      });
    }, 200);
  }

  ngOnInit() {
    setTimeout(() => {
      this.ionInput.setFocus();
    }, 200);
  }

  load(forceSync: boolean = false) {
    this.unitService.index(forceSync).then(units => {
      this.units = this.utilHelper.sort(units);
    });
    this.productService.index(forceSync).then(products => {
      this.productsSearch = this.products = this.utilHelper.sort(products);
    });
  }

  reload($event: any = null, forceSync: boolean = false) {
    this.load();
    if ($event) {
      $event.target.complete();
    }
  }

  async edit() {
    this.item.product_name = this.utilHelper.parseAndTrim(this.product);
    this.item.unit_name = this.utilHelper.parseAndTrim(this.unit);

    if (!this.product.length) {
      alert('Das Produkt fehlt!');
      return;
    }
    this.item.product_name = this.product;
    this.item.amount = this.amount;

    await this.itemService.update(this.item.id, this.shoppingList, this.item);
    this.toast.show(
      `${this.item.amount || ''} ${this.item.unit_name || ''} ${
        this.item.product_name
      } aktualisiert.`
    );
    location.href = `/shopping-lists/${this.shoppingList.id}`;
  }

  searchProduct(name: string) {
    if (!name.length) {
      this.productsSearch = this.products;
    }
    this.productsSearch = this.products.filter(product => {
      return product.name.toLowerCase().includes(name.toLowerCase());
    });
  }

  selectProduct(product: Product) {
    this.product = product.name;
  }

  removeProduct(product: Product) {
    this.productService.destroy(product.name);
    this.reload();
  }
}
