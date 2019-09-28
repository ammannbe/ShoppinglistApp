import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastCtrl: ToastController) {}

  async show(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  async showErrors(err: any): Promise<void> {
    const errors = err.error.errors;
    let message = err.error.message;
    let msg: any;
    for (const [key, error] of Object.entries(errors)) {
      if (error) {
        if (msg !== undefined) {
          msg += `\n${error}`;
          continue;
        }
        msg = error;
      }
    }
    if (msg !== undefined && message) {
      message = msg;
    }
    this.show(message);
  }
}
