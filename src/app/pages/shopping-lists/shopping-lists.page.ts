import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-shopping-lists',
  templateUrl: './shopping-lists.page.html',
  styleUrls: ['./shopping-lists.page.scss']
})
export class ShoppingListsPage implements OnInit {
  constructor(private userService: UserService) {}

  ngOnInit() {}

  async logout(): Promise<void> {
    await this.userService.logout();
    location.href = '/login';
  }
}
