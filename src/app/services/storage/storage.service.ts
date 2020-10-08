import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _cache = [];

  constructor(protected storage: Storage) {}

  public async get(key: any): Promise<any> {
    if (this._cache[key]) {
      console.log(`STORAGE: CACHED ${key} ; ${this._cache[key]}`);
    } else {
      this._cache[key] = await this.storage.get(key);
      console.log(`STORAGE: GET    ${key} ; ${this._cache[key]}`);
    }
    return JSON.parse(this._cache[key]);
  }

  public async set(key: any, value: any): Promise<any> {
    delete this._cache[key];
    value = JSON.stringify(value);
    console.log(`STORAGE: SET    ${key} ; ${value}`);
    return await this.storage.set(key, value);
  }

  public async exists(key: any): Promise<boolean> {
    if (this._cache[key]) {
      return !!this._cache[key];
    }
    console.log(`STORAGE: EXISTS ${key}`);
    return !!(await this.get(key));
  }

  public async remove(key: any): Promise<void> {
    delete this._cache[key];
    console.log(`STORAGE: REMOVE ${key}`);
    await this.storage.remove(key);
  }

  public async clear(): Promise<void> {
    this._cache = [];
    console.log(`STORAGE: CLEAR`);
    await this.storage.clear();
  }
}
