import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading = null;

  constructor(private loadingController: LoadingController) {}

  async show(message = 'Lade...') {
    this.loading = await this.loadingController.create({
      message
    });
    await this.loading.present();
  }

  async dismiss() {
    await this.loading.dismiss();
    this.loading = null;
  }
}
