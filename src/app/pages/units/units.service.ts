import { Injectable } from '@angular/core';

import { SyncService } from './sync.service';
import { UnitsService as DbUnitService } from '../../services/database/units/units.service';
import { Unit } from 'src/app/services/database/units/unit';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  constructor(
    private syncService: SyncService,
    private dbUnit: DbUnitService
  ) {}

  async index(forceSync: boolean = false): Promise<Unit[]> {
    await this.syncService.sync(forceSync);
    return this.dbUnit.select();
  }
}
