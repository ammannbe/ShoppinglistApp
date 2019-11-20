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
  public showAddInput: boolean;
  public showEditInput: boolean;
  public keyboardIsVisible = false;
  public hasShoppingLists = true;

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
          this.hideAdd();
          this.hideEdit();
        }, 200);
      });
    });

    this.keyboard.onKeyboardShow().subscribe(() => {
      this.ngZone.run(() => {
        this.keyboardIsVisible = true;
      });
    });
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
    this.hideAll();
    this.load(forceSync);
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
    this.load();
  }

  hideAll() {
    this.hideAdd();
    this.hideEdit();
  }

  showAdd() {
    this.hideAll();

    setTimeout(() => {
      this.ionInput.setFocus();
    }, 400);

    this.showAddInput = true;
  }

  showAddThroughPullEvent(refresher): void {
    refresher.target.complete();
    this.showAdd();
  }

  hideAdd() {
    this.name = null;
    this.showAddInput = false;
  }

  add() {
    this.name = this.utilHelper.parseAndTrim(this.name);
    if (!this.name.length) {
      alert('Der Name fehlt!');
      setTimeout(() => {
        this.showAdd();
      }, 500);
      return;
    }
    const shoppingList = {} as ShoppingList;
    shoppingList.name = this.name;
    this.shoppingListsService.insert(shoppingList).then(() => {
      this.reload();
    });
  }

  showEdit(shoppingList: ShoppingList) {
    this.hideAll();

    setTimeout(() => {
      this.ionInput.setFocus();
    }, 400);

    this.shoppingList = shoppingList;
    this.name = shoppingList.name;
    this.showEditInput = true;
  }

  hideEdit() {
    this.shoppingList = null;
    this.name = null;
    this.showEditInput = false;
  }

  edit() {
    if (this.name.length) {
      this.name = this.name.trim();
    }
    if (!this.name.length) {
      alert('Der Name fehlt!');
      setTimeout(() => {
        this.showAdd();
      }, 500);
      return;
    }
    const shoppingList = {} as ShoppingList;
    shoppingList.name = this.name;
    this.shoppingListsService
      .update(this.shoppingList.id, shoppingList)
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
              .then(() => {
                this.toast.show(
                  `"${shoppingList.name}" erfolgreich mit ${data.email} geteilt.`
                );
                this.reload();
              })
              .catch(err => {
                console.log(err);
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
