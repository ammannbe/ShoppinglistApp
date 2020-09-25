import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../user/user.service';
import { ToastService } from 'src/app/services/toast/toast.service';

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
    private router: Router
  ) {}

  ngOnInit() {
    this.redirectIfLoggedIn();
  }

  async redirectIfLoggedIn() {
    setTimeout(async () => {
      if (await this.userService.isLoggedIn()) {
        this.router.navigate(['/shopping-lists']);
      }
    }, 500);
  }

  async login() {
    try {
      await this.userService.login(this.email, this.password);
      this.router.navigate(['/shopping-lists']);
    } catch (error) {
      this.toast.showErrors(error);
      return;
    }
  }

  async useOffline() {
    await this.userService.loginOffline();
    this.router.navigate(['/shopping-lists']);
  }
}
