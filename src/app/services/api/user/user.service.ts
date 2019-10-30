import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api.service';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private prefix = '/user';

  constructor(private api: ApiService) {}

  show(): Observable<User[]> {
    return this.api.get<User[]>(this.prefix);
  }

  update(user: User): Observable<User[]> {
    return this.api.patch<User[]>(this.prefix, user);
  }
}
