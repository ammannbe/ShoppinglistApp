import { Injectable } from '@angular/core';
import { DbService } from '../_base/db.service';
import { Unit } from './unit';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  private table = 'units';

  constructor(private db: DbService) {}

  use() {
    this.db.use(this.table);
  }

  async select(withTrashed: boolean = false): Promise<Unit[]> {
    this.use();
    return this.db.select<Unit>(null, withTrashed);
  }

  async find(name: string): Promise<Unit> {
    this.use();
    return this.db.findByName<Unit>(name);
  }

  async insert(unit: Unit): Promise<void> {
    this.use();
    this.db.insert(unit);
  }

  async delete(name: string): Promise<void> {
    this.use();
    this.db.deleteBy('name', name);
  }

  async forceDelete(name: string): Promise<void> {
    this.use();
    this.db.forceDeleteBy('name', name);
  }
}
