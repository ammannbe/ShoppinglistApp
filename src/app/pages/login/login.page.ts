import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../user/user.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { RegisterService } from 'src/app/services/api/register/register.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  public email: string;
  public password: string;

  constructor(
    private userService: UserService,
    private toast: ToastService,
    private registerService: RegisterService,
    private router: Router
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.userService.isLoggedIn().then(result => {
        if (result) {
          this.router.navigate(['/shopping-lists']);
        }
      });
    }, 500);
  }

  async login() {
    await this.userService
      .login(this.email, this.password, true)
      .then(result => {
        this.registerService.status().subscribe(data => {
          if (data.verified === true) {
            this.router.navigate(['/shopping-lists']);
          } else {
            this.registerService.resend().subscribe(d => {
              this.toast.show(d.message);
            });
          }
        });
      })
      .catch(err => {
        this.toast.showErrors(err);
      });
  }

  async useOffline() {
    await this.userService.loginOffline();
    this.router.navigate(['/shopping-lists']);
  }
}
