import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { IonInput, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { ShoppingList } from 'src/app/services/database/shopping-lists/shopping-list';
import { User } from './../user/user';
import { UserService } from '../user/user.service';
import { ShoppingListsService } from './shopping-lists.service';
import { UtilHelperService } from 'src/app/services/util-helper.service';
import { ShoppingListSharesService } from 'src/app/services/api/shopping-lists/shopping-list-shares.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { LoadingService } from 'src/app/services/loading.service';

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
    private shoppingListsService: ShoppingListsService,
    private shoppingListShareService: ShoppingListSharesService,
    private utilHelper: UtilHelperService,
    private toast: ToastService,
    private loading: LoadingService,
    private keyboard: Keyboard,
    private ngZone: NgZone,
    private statusBar: StatusBar,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.load();
    }, 200);

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
    if (this.slidingItemIsOpen()) {
      this.slidingItem.close();
      this.slidingItem = null;
    }
  }

  slidingItemIsOpen(): boolean {
    return !!this.slidingItem;
  }

  async load(forceSync: boolean = false, callback = null) {
    this.loading.show();

    if (callback !== null) {
      callback();
    }

    this.userService.show().then(user => {
      this.user = user;
    });
    this.hasShoppingLists = true;
    this.shoppingLists = await this.shoppingListsService.index(forceSync);
    if (!this.shoppingLists.length) {
      this.hasShoppingLists = false;
    }

    this.loading.dismiss();
  }

  reload(forceSync: boolean = false, callback = null, $event: any = null) {
    this.hideAllInputs();
    this.load(forceSync, callback);
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
    this.reload(false, () =>
      this.shoppingListsService.destroy(shoppingList.id)
    );
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

  add() {
    this.name = this.utilHelper.parseAndTrim(this.name);
    if (!this.name.length) {
      alert('Der Name fehlt!');
      setTimeout(() => {
        this.showAddInput();
      }, 500);
      return;
    }
    const shoppingList = {} as ShoppingList;
    shoppingList.name = this.name;
    this.reload(false, () => this.shoppingListsService.insert(shoppingList));
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

  edit() {
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

    this.reload(false, () =>
      this.shoppingListsService.update(this.editShoppingList.id, {
        name: this.name
      } as ShoppingList)
    );
  }

  async showShare(shoppingList: ShoppingList) {
    if (!shoppingList.remote_id) {
      this.toast.show('Nur Online-Einkaufslisten können geteilt werden.');
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
          handler: data => {
            this.reload();
          }
        },
        {
          text: 'Teilen',
          handler: data => {
            this.shoppingListShareService
              .store(shoppingList.remote_id, data.email)
              .toPromise()
              .then(() => {
                this.toast.show(
                  `"${shoppingList.name}" erfolgreich mit ${data.email} geteilt.`
                );
                this.reload();
              })
              .catch(err => {
                this.toast.showErrors(err);
              });
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
          handler: () => {
            this.reload();
          }
        },
        {
          text: 'Bestätigen',
          handler: () => {
            this.shoppingListsService.destroy(shoppingList.id).then(() => {
              this.reload();
            });
          }
        }
      ]
    });
    alert.present();
  }
}
