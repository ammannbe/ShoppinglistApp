import { Component, OnInit, ViewChild } from '@angular/core';

import { ItemsService } from '../items.service';
import { ActivatedRoute } from '@angular/router';
import { ShoppingListsService } from '../../shopping-lists/shopping-lists.service';
import { ShoppingList } from 'src/app/services/database/shopping-lists/shopping-list';
import { Item } from 'src/app/services/database/items/item';
import { UserService } from 'src/app/services/database/user/user.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ProductsService } from '../../products/products.service';
import { Product } from '../../products/product';
import { UtilHelperService } from 'src/app/services/util-helper.service';
import { AlertController, IonInput } from '@ionic/angular';
import { UnitsService } from '../../units/units.service';
import { Unit } from 'src/app/services/database/units/unit';

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
    private itemService: ItemsService,
    private userService: UserService,
    private unitService: UnitsService,
    private activatedRoute: ActivatedRoute,
    private shoppingListService: ShoppingListsService,
    private productService: ProductsService,
    private toast: ToastService,
    private utilHelper: UtilHelperService,
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

  ngOnInit() {
    setTimeout(() => {
      this.ionInput.setFocus();
    }, 200);
  }

  async load(forceSync: boolean = false) {
    try {
      this.products = this.utilHelper.sort(
        await this.productService.index(forceSync)
      );
      this.productsSearch = this.products;
      this.units = this.utilHelper.sort(
        await this.unitService.index(forceSync)
      );
    } catch (error) {}
  }

  reload($event: any = null, forceSync: boolean = false) {
    this.load(forceSync);
    if ($event) {
      $event.target.complete();
    }
  }

  async add() {
    this.product = this.utilHelper.parseAndTrim(this.product);
    this.unit = this.utilHelper.parseAndTrim(this.unit);

    if (!this.product.length) {
      alert('Das Produkt fehlt!');
      this.load();
      return;
    }

    await this.addProduct(this.product);

    const email = await this.userService.getEmail();
    const item: Item = {
      id: null,
      remote_id: null,
      shopping_list_id: this.shoppingList.id,
      product_name: this.product,
      unit_name: this.unit,
      creator_email: email,
      amount: this.amount,
      done: false,
      created_at: null,
      updated_at: null,
      deleted_at: null
    };
    const items = await this.itemService.index(this.shoppingList);
    let found = null;
    if (items.length) {
      found = items.find(i => {
        return i.product_name === item.product_name;
      });
    }
    if (items.length && found) {
      const alert = await this.alertController.create({
        header: 'Eintrag existiert bereits.',
        message:
          'Es existiert bereits ein Eintrag mit diesem Produkt. Einträge zusammenführen?',
        buttons: [
          {
            text: 'Abbrechen',
            role: 'cancel',
            handler: () => {}
          },
          {
            text: 'Nein',
            handler: () => {
              this.itemService.insert(this.shoppingList, item);
              this.toast.show(
                `${item.amount || ''} ${item.unit_name || ''} ${
                  item.product_name
                } hinzugefügt.`
              );
            }
          },
          {
            text: 'Ja, zusammenführen',
            handler: () => {
              let amount = 1;
              if (item.amount !== null) {
                amount = item.amount;
              }
              if (found.amount === null) {
                found.amount = 1;
              }
              found.amount += amount;
              this.itemService.update(found.id, this.shoppingList, found);
              this.toast.show(`Eintrag aktualisiert.`);
            }
          }
        ]
      });
      alert.present();
    } else {
      this.itemService.insert(this.shoppingList, item);
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
            handler: () => {
              this.reload();
            }
          },
          {
            text: 'Ja, hinzufügen',
            handler: () => {
              this.productService.insert(name).then(() => {
                this.toast.show(`${name} hinzugefügt.`);
              });
            }
          }
        ]
      });
      alert.present();
    }
  }
}
