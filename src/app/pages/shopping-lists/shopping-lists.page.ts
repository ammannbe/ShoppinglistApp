import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { LoadingController, IonInput, AlertController } from '@ionic/angular';

import { UserService } from '../user/user.service';
import { ShoppingListsService } from './shopping-lists.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ShoppingList } from 'src/app/services/database/shopping-lists/shopping-list';
import { UtilHelperService } from 'src/app/services/util-helper.service';
import { ShoppingListSharesService } from 'src/app/services/api/shopping-lists/shopping-list-shares.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { User } from 'src/app/services/database/user/user';

@Component({
  selector: 'app-shopping-lists',
  templateUrl: './shopping-lists.page.html',
  styleUrls: ['./shopping-lists.page.scss']
})
export class ShoppingListsPage implements OnInit {
  @ViewChild('autofocus', { static: false }) ionInput: IonInput;

  public name = '';
  public shoppingList: ShoppingList;
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
    private loading: LoadingController,
    private keyboard: Keyboard,
    private ngZone: NgZone,
    private statusBar: StatusBar,
    private alertController: AlertController
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
    if (this.slidingItem !== null) {
      this.slidingItem.close();
      this.slidingItem = null;
    }
  }

  load(forceSync: boolean = false) {
    this.shoppingListsService.index(forceSync).then(shoppingLists => {
      this.shoppingLists = shoppingLists;
      if (!this.shoppingLists.length) {
        this.hasShoppingLists = false;
      }
    });
    this.userService.show().then(user => {
      this.user = user;
    });
  }

  reload($event: any = null, forceSync: boolean = false) {
    this.hideAllInputs();
    this.load(forceSync);
    this.closeSlidingItemIfOpen();
    if ($event) {
      $event.target.complete();
    }
  }

  async logout(): Promise<void> {
    await this.userService.logout();
    location.href = '/login';
  }

  async delete(shoppingList: ShoppingList) {
    const loading = await this.loading.create({
      message: 'Der Ofen wird ausgeschaltet...'
    });
    loading.present();
    this.shoppingListsService.destroy(shoppingList.id).then(() => {
      loading.dismiss();
    });
    this.reload();
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
    this.shoppingListsService.insert(shoppingList).then(() => {
      this.reload();
    });
  }

  showEditInput(shoppingList: ShoppingList) {
    this.hideAllInputs();

    setTimeout(() => {
      this.ionInput.setFocus();
    }, 400);

    this.shoppingList = shoppingList;
    this.name = shoppingList.name;
    this.editInputIsVisible = true;
  }

  hideEditInput() {
    this.shoppingList = null;
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

    this.shoppingListsService
      .update(this.shoppingList.id, { name: this.name } as ShoppingList)
      .then(() => {
        this.reload();
      });
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
