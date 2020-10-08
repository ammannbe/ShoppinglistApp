import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ObjectsStorageService } from './../objects-storage.service';
import { Unit } from './unit';

@Injectable({
  providedIn: 'root'
})
export class UnitService extends ObjectsStorageService {
  private key = 'units';

  constructor(protected storage: Storage) {
    super(storage);
  }

  public async get(withTrashed = false): Promise<Unit[]> {
    return await super.get(this.key, withTrashed);
  }

  public async set(units: Unit[]): Promise<Unit[]> {
    return await super.set(this.key, units);
  }

  public async push(unit: Unit): Promise<Unit[]> {
    return await super.push(this.key, unit);
  }

  public async remove(unit: Unit, force = false): Promise<void> {
    const payload = { p: 'name', v: unit.name };
    return await this.removeObject(this.key, payload, force);
  }
}
