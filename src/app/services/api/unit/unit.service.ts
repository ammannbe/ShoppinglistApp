import { Injectable } from '@angular/core';

import { ApiService } from '../api.service';
import { Unit } from './../../storage/unit/unit';

@Injectable({
  providedIn: 'root'
})
export class UnitService extends ApiService {
  protected path = 'units';

  index(): Promise<Unit[]> {
    return super.get<Unit[]>(this.path);
  }

  store(unit: Unit): Promise<Unit> {
    return super.post<Unit>(this.path, unit);
  }
}
