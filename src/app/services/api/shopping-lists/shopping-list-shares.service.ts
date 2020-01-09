import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListSharesService {
  private prefix = '/shopping-lists';
  private suffix = 'shares';

  constructor(private api: ApiService) {}

  index(shoppingListId: number): Observable<any> {
    return this.api.get(`${this.prefix}/${shoppingListId}/${this.suffix}`);
  }

  store(shoppingListId: number, email: string): Observable<any> {
    return this.api.post(`${this.prefix}/${shoppingListId}/${this.suffix}`, { email });
  }

  destroy(shoppingListId: number, email: string): Observable<any> {
    return this.api.delete(`${this.prefix}/${shoppingListId}/${this.suffix}/${email}`);
  }
}
