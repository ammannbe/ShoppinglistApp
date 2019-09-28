import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastCtrl: ToastController) {}

  async show(
    message: string,
    duration: number = 3000,
    position: 'bottom' | 'top' | 'middle' = 'bottom'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position
    });
    toast.present();
  }

  async showErrors(err: any): Promise<void> {
    if (err.status === 0) {
      return this.show(
        'Upps... Der Server ist zur Zeit nicht erreichbar :-(\n' +
          'Versuche es später noch einmal.',
        5000
      );
    }
    const obj = err.error;
    let message = obj.message;
    let msg: any;

    if (obj.errors) {
      const errors = obj.errors;
      for (const [key, error] of Object.entries(errors)) {
        if (error) {
          if (msg !== undefined) {
            msg += `\n${error}`;
            continue;
          }
          msg = error;
        }
      }
    }
    if (msg !== undefined && message) {
      message = msg;
    }
    this.show(message);
  }
}
