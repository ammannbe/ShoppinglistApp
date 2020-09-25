import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private storage: Storage) {}

  public async set(key: any, value: any): Promise<any> {
    value = JSON.stringify(value);
    console.log(`STORAGE: SET    ${key} ; ${value}`);
    return await this.storage.set(key, value);
  }

  public async get(key: any): Promise<any> {
    const value = await this.storage.get(key);
    console.log(`STORAGE: GET    ${key} ; ${value}`);
    return JSON.parse(value);
  }

  public async update(
    key: any,
    property: string | number,
    value: any
  ): Promise<void> {
    console.log(`STORAGE: UPDATE ${key} ; ${property} ; ${value}`);
    let el = await this.get(key);
    if (typeof el === 'object' && el !== null) {
      el[property] = value;
    }
    if (el === null) {
      el = { [property]: value };
    }
    await this.set(key, el);
  }

  public async exists(key: any): Promise<boolean> {
    console.log(`STORAGE: EXISTS ${key}`);
    return !!(await this.get(key));
  }

  public async remove(key: any): Promise<void> {
    console.log(`STORAGE: REMOVE ${key}`);
    await this.storage.remove(key);
  }

  public async clear(): Promise<void> {
    console.log(`STORAGE: CLEAR`);
    await this.storage.clear();
  }
}
