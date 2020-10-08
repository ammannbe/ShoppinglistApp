import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuid, validate as isUuid } from 'uuid';

import { UnitService } from 'src/app/services/storage/unit/unit.service';
import { UnitSyncService } from 'src/app/services/sync/unit/unit-sync.service';
import { Unit } from 'src/app/services/storage/unit/unit';

import { Item } from 'src/app/services/storage/item/item';
import { ItemService } from 'src/app/services/storage/item/item.service';

import { ShoppingListService } from 'src/app/services/storage/shopping-list/shopping-list.service';
import { ShoppingList } from 'src/app/services/storage/shopping-list/shopping-list';

import { ProductService } from 'src/app/services/storage/product/product.service';
import { ProductSyncService } from 'src/app/services/sync/product/product-sync.service';
import { Product } from 'src/app/services/storage/product/product';

import { ToastService } from 'src/app/services/toast/toast.service';

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
    private itemService: ItemService,
    private unitService: UnitService,
    private unitSyncService: UnitSyncService,
    private shoppingListService: ShoppingListService,
    private productService: ProductService,
    private productSyncService: ProductSyncService,
    private toast: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    setTimeout(() => {
      this.activatedRoute.paramMap.subscribe(async paramMap => {
        if (!paramMap.has('id')) {
          this.router.navigate(['/shopping-lists']);
          return;
        }

        let id: string | number;
        if (isUuid(paramMap.get('id'))) {
          id = paramMap.get('id');
        } else {
          id = +paramMap.get('id');
        }

        this.item = await this.itemService.find(id);
        this.amount = this.item.amount;
        this.unit = this.item.unit_name;
        this.product = this.item.product_name;

        this.shoppingList = await this.shoppingListService.find(
          this.item.shopping_list_id
        );
        await this.load(true);

        setInterval(() => this.load(true), 30000);
      });
    }, 200);
  }

  ngOnInit() {
    setTimeout(() => {
      this.ionInput.setFocus();
    }, 200);
  }

  async load(sync = false, onlyPush = false) {
    if (sync) {
      await this.unitSyncService.sync(onlyPush);
      await this.productSyncService.sync(onlyPush);
    }

    this.products = (await this.productService.get()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    this.productsSearch = this.products;
    this.units = (await this.unitService.get()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  async reload(sync = false, onlyPush = false, $event: any = null) {
    await this.load(sync, onlyPush);

    if ($event) {
      $event.target.complete();
    }
  }

  async edit() {
    if (this.product) this.product = this.product.trim();
    if (this.unit) this.unit = this.unit.trim();

    if (!this.product) {
      alert('Das Produkt fehlt!');
      return;
    }

    this.item = {
      ...this.item,
      product_name: this.product,
      unit_name: this.unit,
      amount: this.amount
    };

    await this.itemService.update(this.item, this.item);
    this.toast.show(
      `${this.item.amount || ''} ${this.item.unit_name || ''} ${
        this.item.product_name
      } aktualisiert.`
    );
    this.router.navigate(['/shopping-lists', this.shoppingList.id]);
  }

  searchProduct(name: string) {
    name = name.trim();
    if (!name) {
      this.productsSearch = this.products;
    }

    this.productsSearch = this.products.filter(product => {
      return product.name.toLowerCase().includes(name.toLowerCase());
    });
  }

  selectProduct(product: Product) {
    this.product = product.name;
  }

  async removeProduct(product: Product) {
    await this.productService.remove(product);
    this.reload(true, false);
  }
}
