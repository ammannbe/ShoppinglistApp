import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { DbService } from '../_base/db.service';
import { QueriesService } from '../_base/queries.service';
import { Unit } from './unit';

@Injectable({
  providedIn: 'root'
})
export class UnitsService extends DbService {
  protected table = 'units';

  constructor(protected sqlite: SQLite, protected queries: QueriesService) {
    super(sqlite, queries);
  }

  async select<Unit = any>(withTrashed: boolean = false): Promise<Unit[]> {
    return super.select<Unit>(null, withTrashed);
  }
}
