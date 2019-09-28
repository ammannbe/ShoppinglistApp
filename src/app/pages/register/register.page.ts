import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

import { RegisterService } from 'src/app/services/api/register/register.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {
  public email: string;
  public password: string;
  public passwordConfirmation: string;

  constructor(
    private registerService: RegisterService,
    private toastService: ToastService,
    private nav: NavController
  ) {}

  ngOnInit() {}

  async register(): Promise<void> {
    await this.registerService
      .register(this.email, this.password, this.passwordConfirmation)
      .subscribe(
        () => {
          this.toastService.show(
            'Wir haben dir eine Bestätigungsmail zugesendet.'
          );
          this.nav.navigateForward(['login']);
        },
        err => {
          this.toastService.showErrors(err);
        }
      );
  }
}
