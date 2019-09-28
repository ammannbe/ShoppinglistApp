import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { LoadingController, IonInput, AlertController } from '@ionic/angular';

import { UserService } from '../user/user.service';
import { ShoppingListsService } from './shopping-lists.service';
import { ShoppingList } from './shopping-list';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ToastService } from 'src/app/services/toast/toast.service';

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
  public email: string;
  public showAddInput: boolean;
  public showEditInput: boolean;
  public keyboardIsVisible = false;

  constructor(
    private userService: UserService,
    private shoppingListsService: ShoppingListsService,
    private loading: LoadingController,
    private toast: ToastService,
    private keyboard: Keyboard,
    private ngZone: NgZone,
    private statusBar: StatusBar,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // TODO: needs improvements
    setTimeout(() => {
      this.load();
    }, 400);

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
        }, 200); // Make it a little bit smoother
      });
    });

    this.keyboard.onKeyboardShow().subscribe(() => {
      this.ngZone.run(() => {
        this.keyboardIsVisible = true;
      });
    });
  }

  load() {
    this.shoppingListsService.index().then(shoppingLists => {
      this.shoppingLists = shoppingLists;
    });
  }

  reload() {
    this.hideAll();
    this.load();
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
    if (!this.name) {
      alert('Der Name fehlt!');
      setTimeout(() => {
        this.showAdd();
      }, 500);
      return;
    }
    this.shoppingListsService.insert(this.name).then(() => {
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
    if (!this.name.length) {
      alert('Der Name fehlt!');
      setTimeout(() => {
        this.showAdd();
      }, 500);
      return;
    }
    this.shoppingListsService
      .update(this.shoppingList.id, this.name)
      .then(() => {
        this.reload();
      });
  }

  async showShare(shoppingList: ShoppingList) {
    console.log('test');
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
            this.shoppingListsService
              .share(shoppingList.id, data.email)
              .subscribe(
                () => {
                  this.toast.show(
                    `"${shoppingList.name}" erfolgreich geteilt.`
                  );
                  this.reload();
                },
                err => {
                  console.log(err);
                  this.toast.showErrors(err);
                }
              );
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
