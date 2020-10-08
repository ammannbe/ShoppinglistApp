import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonInput } from '@ionic/angular';
import { v4 as uuid, validate as isUuid } from 'uuid';
import { ToastService } from 'src/app/services/toast/toast.service';

import { ItemService } from 'src/app/services/storage/item/item.service';
import { Item } from 'src/app/services/storage/item/item';

import { ShoppingListService } from 'src/app/services/storage/shopping-list/shopping-list.service';
import { ShoppingList } from 'src/app/services/storage/shopping-list/shopping-list';

import { UnitService } from 'src/app/services/storage/unit/unit.service';
import { UnitSyncService } from 'src/app/services/sync/unit/unit-sync.service';
import { Unit } from 'src/app/services/storage/unit/unit';

import { ProductService } from 'src/app/services/storage/product/product.service';
import { ProductSyncService } from 'src/app/services/sync/product/product-sync.service';
import { Product } from 'src/app/services/storage/product/product';

import { UserService } from 'src/app/services/storage/user/user.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss']
})
export class AddPage implements OnInit {
  @ViewChild('autofocus', { static: false }) ionInput: IonInput;

  public products: Product[];
  public productsSearch: Product[];
  public shoppingList: ShoppingList;
  public amount: number = null;
  public unit: string = null;
  public units: Unit[];
  public product: string = null;

  constructor(
    private itemService: ItemService,
    private userService: UserService,
    private unitService: UnitService,
    private shoppingListService: ShoppingListService,
    private productService: ProductService,
    private productSyncService: ProductSyncService,
    private unitSyncService: UnitSyncService,
    private toast: ToastService,
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
        if (isUuid(paramMap.get('id'))) {
          id = paramMap.get('id');
        } else {
          id = +paramMap.get('id');
        }

        this.shoppingList = await this.shoppingListService.find(id);
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

  async add() {
    const product = this.product || '';
    const unit = this.unit || '';
    this.product = product.trim();
    this.unit = unit.trim();

    if (!this.product.length) {
      alert('Das Produkt fehlt!');
      return;
    }

    await this.addProduct(this.product);

    const user = await this.userService.get();
    const item: Item = {
      id: uuid(),
      shopping_list_id: this.shoppingList.id,
      product_name: this.product,
      unit_name: this.unit,
      creator_email: user.email || null,
      amount: this.amount,
      done: false,
      created_at: null,
      updated_at: null,
      deleted_at: null
    };

    const elements = await this.itemService.searchByProduct(
      this.shoppingList.id,
      this.product
    );

    if (elements.length) {
      const alert = await this.alertController.create({
        header: 'Eintrag existiert bereits.',
        message:
          'Ein Eintrag mit diesem Namen existiert bereits. Zusammenführen?',
        buttons: [
          { text: 'Abbrechen', role: 'cancel' },
          {
            text: 'Nein',
            handler: () => this.addNewItem(item)
          },
          {
            text: 'Ja, zusammenführen',
            handler: async () => {
              const found = elements.find(e => true); // get the first item
              await this.updateItem(item, found);
            }
          }
        ]
      });
      alert.present();
    } else {
      await this.itemService.push(item);
      this.toast.show(
        `${item.amount || ''} ${item.unit_name || ''} ${
          item.product_name
        } hinzugefügt.`
      );
    }
    this.product = null;
    this.unit = null;
    this.amount = null;
  }

  private async addNewItem(item: Item) {
    await this.itemService.push(item);
    this.toast.show(
      `${item.amount || ''} ${item.unit_name || ''} ${
        item.product_name
      } hinzugefügt.`
    );
  }

  private async updateItem(item: Item, toUpdate: Item) {
    let amount = 1;
    if (item.amount !== null) {
      amount = item.amount;
    }
    if (toUpdate.amount === null) {
      toUpdate.amount = 1;
    }
    toUpdate.amount += amount;
    await this.itemService.update(toUpdate, toUpdate);
    this.toast.show('Eintrag aktualisiert.');
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

  async removeProduct(product: Product) {
    await this.productService.remove(product);
    await this.reload(true, true);
  }

  async addProduct(name: string): Promise<void> {
    let found = null;
    if (this.products) {
      found = this.products.find(product => {
        return product.name.toLowerCase() === name.toLowerCase();
      });
    }
    if (!found) {
      const alert = await this.alertController.create({
        header: `"${name}" existiert noch nicht.`,
        message: `"${name}" ist in deiner Produktliste noch nicht vorhanden. Eintrag hinzufügen?`,
        buttons: [
          {
            text: 'Nein',
            role: 'cancel',
            handler: () => {}
          },
          {
            text: 'Ja, hinzufügen',
            handler: async () => {
              await this.productService.push({ name } as Product);
              await this.reload(true, true);
              this.toast.show(`${name} hinzugefügt.`);
            }
          }
        ]
      });
      alert.present();
    }
  }
}
