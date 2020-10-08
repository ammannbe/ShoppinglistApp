import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ObjectsStorageService extends StorageService {
  public async findBy(key: any, { p, v }, withTrashed = false): Promise<any> {
    return (await this.searchBy(key, { p, v }, withTrashed))[0];
  }

  public async searchBy(
    key: any,
    { p, v },
    withTrashed = false
  ): Promise<any[]> {
    const elements = await this.get(key, withTrashed);
    return elements.filter(el => el[p] === v);
  }

  public async get(key: any, withTrashed = false): Promise<any[]> {
    const elements = (await super.get(key)) as any[];

    if (!elements || !Array.isArray(elements)) {
      return [];
    }

    if (!withTrashed) {
      return elements.filter(e => !e.deleted_at);
    }

    return elements;
  }

  public async set(key: any, value: any[]): Promise<any[]> {
    return await super.set(key, value);
  }

  public async update(
    key: any,
    value: any,
    { p, v },
    timestamp = true
  ): Promise<any[]> {
    const elements = await this.get(key);
    const i = elements.findIndex(e => e[p] === v);
    if (timestamp) {
      value.updated_at = new Date();
    }
    console.log(`STORAGE: UPDATE ${key} ; ${i} ; ${p},${v}`);
    console.log(elements[i]);
    elements[i] = { ...elements[i], ...value };
    console.log(elements[i]);
    return await super.set(key, elements);
  }

  public async push(key: any, value: any): Promise<any[]> {
    const elements = await this.get(key);
    elements.push(value);
    console.log(`STORAGE: PUSH ${key} ; ${JSON.stringify(value)}`);
    return await super.set(key, elements);
  }

  public async pop(key: any, { p, v }): Promise<any[]> {
    const elements = await this.get(key);
    const i = elements.findIndex(e => e[p] === v);
    console.log(`STORAGE: POP ${key} ; ${i}`);
    elements.splice(i, 1);
    return await super.set(key, elements);
  }

  public async removeObject(key: any, { p, v }, force = false): Promise<void> {
    console.log(`STORAGE: REMOVE OBJECT ${key} ; force: ${force} ; ${p},${v}`);

    const elements = await this.get(key);
    const i = elements.findIndex(e => e[p] === v);

    if (force) {
      elements.splice(i, 1);
      await super.set(key, elements);
      return;
    }

    elements[i] = { ...elements[i], deleted_at: new Date() };
    await super.set(key, elements);
    return;
  }
}
