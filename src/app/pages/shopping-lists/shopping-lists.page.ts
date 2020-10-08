import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { IonInput, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { v4 as uuid, validate as validateUuid } from 'uuid';
import { ToastService } from 'src/app/services/toast/toast.service';

import { UserService } from '../user/user.service';
import { User } from 'src/app/services/storage/user/user';

import { ShoppingListSyncService } from './../../services/sync/shopping-list/shopping-list-sync.service';
import { ShoppingListService } from './../../services/storage/shopping-list/shopping-list.service';
import { ShoppingListShareService } from 'src/app/services/api/shopping-list/shopping-list-share.service';
import { ShoppingList } from 'src/app/services/storage/shopping-list/shopping-list';

@Component({
  selector: 'app-shopping-lists',
  templateUrl: './shopping-lists.page.html',
  styleUrls: ['./shopping-lists.page.scss']
})
export class ShoppingListsPage implements OnInit {
  @ViewChild('autofocus', { static: false }) ionInput: IonInput;

  public name = '';
  public editShoppingList: ShoppingList;
  public shoppingLists: ShoppingList[];
  public user: User;
  public email: string;
  public addInputIsVisible: boolean;
  public editInputIsVisible: boolean;
  public keyboardIsVisible = false;
  public hasShoppingLists = true;
  public slidingItem = null;

  constructor(
    private userService: UserService,
    private shoppingListService: ShoppingListService,
    private shoppingListSyncService: ShoppingListSyncService,
    private shoppingListShareService: ShoppingListShareService,
    private toast: ToastService,
    private keyboard: Keyboard,
    private ngZone: NgZone,
    private statusBar: StatusBar,
    private alertController: AlertController,
    private router: Router
  ) {
    setTimeout(async () => {
      await this.load(true);
      setInterval(() => this.load(true), 30000);
    }, 200);
  }

  ngOnInit() {
    this.statusBar.styleBlackOpaque();
    this.subscribeKeyboardEvents();
  }

  subscribeKeyboardEvents() {
    this.keyboard.onKeyboardHide().subscribe(() => {
      this.ngZone.run(() => {
        this.keyboardIsVisible = false;
        setTimeout(() => {
          this.hideAddInput();
          this.hideEditInput();
        }, 200);
      });
    });

    this.keyboard.onKeyboardShow().subscribe(() => {
      this.ngZone.run(() => {
        this.keyboardIsVisible = true;
      });
    });
  }

  isUuid(id: number | string) {
    return validateUuid(id.toString());
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
    if (!this.slidingItem) {
      return;
    }

    this.slidingItem.close();
    this.slidingItem = null;
  }

  async load(sync = false, onlyPush = false) {
    this.user = await this.userService.show();

    this.hasShoppingLists = true;
    if (sync) {
      await this.shoppingListSyncService.sync(onlyPush);
    }
    this.shoppingLists = await this.shoppingListService.get();

    if (!this.shoppingLists.length) {
      this.hasShoppingLists = false;
    }
  }

  async reload(sync = false, onlyPush = false, $event: any = null) {
    this.hideAllInputs();
    await this.load(sync, onlyPush);
    this.closeSlidingItemIfOpen();

    if ($event) {
      $event.target.complete();
    }
  }

  async logout(): Promise<void> {
    await this.userService.logout();
    this.router.navigate(['/login']);
  }

  open(shoppingList: ShoppingList) {
    if (this.keyboardIsVisible || this.slidingItem) {
      return;
    }

    this.router.navigate(['/shopping-lists', shoppingList.id]);
  }

  async delete(shoppingList: ShoppingList) {
    await this.shoppingListService.remove(shoppingList);
    this.reload(true, false);
  }

  hideAllInputs() {
    this.hideAddInput();
    this.hideEditInput();
  }

  showAddInput() {
    this.hideAllInputs();
    this.closeSlidingItemIfOpen();

    setTimeout(() => {
      this.ionInput.setFocus();
    }, 400);

    this.addInputIsVisible = true;
  }

  hideAddInput() {
    this.name = null;
    this.addInputIsVisible = false;
    this.closeSlidingItemIfOpen();
  }

  async add() {
    if (this.name) this.name = this.name.trim();

    if (!this.name) {
      alert('Der Name fehlt!');
      setTimeout(() => {
        this.showAddInput();
      }, 500);
      return;
    }

    const shoppingList: ShoppingList = {
      id: uuid(),
      name: this.name,
      owner_email: this.user.email || null,
      created_at: null,
      updated_at: null,
      deleted_at: null
    };

    await this.shoppingListService.push(shoppingList);

    await this.reload(true, false);
  }

  showEditInput(shoppingList: ShoppingList) {
    this.hideAllInputs();

    setTimeout(() => {
      this.ionInput.setFocus();
    }, 400);

    this.editShoppingList = shoppingList;
    this.name = shoppingList.name;
    this.editInputIsVisible = true;
  }

  hideEditInput() {
    this.editShoppingList = null;
    this.name = null;
    this.editInputIsVisible = false;
    this.closeSlidingItemIfOpen();
  }

  async edit() {
    if (this.name.length) {
      this.name = this.name.trim();
    }
    if (!this.name.length) {
      alert('Der Name fehlt!');
      setTimeout(() => {
        this.showAddInput();
      }, 500);
      return;
    }

    await this.shoppingListService.update(this.editShoppingList, {
      ...this.editShoppingList,
      name: this.name
    });
    this.reload(true, false);
  }

  async showShare(shoppingList: ShoppingList) {
    if (!shoppingList.id) {
      this.toast.show(
        'Nur Synchronisierte-Einkaufslisten können geteilt werden.'
      );
      return;
    }
    const alert = await this.alertController.create({
      header: `"${shoppingList.name}" teilen.`,
      inputs: [
        {
          name: 'email',
          placeholder: 'E-Mail',
          type: 'email'
        }
      ],
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => this.reload()
        },
        {
          text: 'Teilen',
          handler: async data => {
            try {
              await this.shoppingListShareService.store(
                +shoppingList.id,
                data.email
              );

              const text = `"${shoppingList.name}" erfolgreich mit ${data.email} geteilt.`;
              this.toast.show(text);

              await this.reload(true, false);
            } catch (error) {
              this.toast.showErrors(error);
            }
          }
        }
      ]
    });
    alert.present();
  }

  async remove(shoppingList: ShoppingList) {
    const alert = await this.alertController.create({
      message: `Möchtest du ${shoppingList.name} wirklich löschen?`,
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => this.reload()
        },
        {
          text: 'Bestätigen',
          handler: async () => {
            await this.shoppingListService.remove(shoppingList);
            this.reload(true, false);
          }
        }
      ]
    });
    alert.present();
  }
}
