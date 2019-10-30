import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api.service';
import { Unit } from './unit';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  private prefix = '/units';

  constructor(private api: ApiService) {}

  index(): Observable<Unit[]> {
    return this.api.get<Unit[]>(this.prefix);
  }

  store(unit: Unit): Observable<Unit> {
    return this.api.post<Unit>(this.prefix, unit);
  }
}
