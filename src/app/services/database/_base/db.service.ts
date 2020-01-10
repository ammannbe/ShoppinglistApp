import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { QueriesService } from './queries.service';

@Injectable({
  providedIn: 'root'
})
export abstract class DbService {
  private dbName = 'shoppinglist.db';
  private dbLocation = 'default';
  private database: SQLiteObject;
  protected table: string;

  constructor(protected sqlite: SQLite, protected queries: QueriesService) {}

  private async createDatabaseIfNotReady(firstRun = false): Promise<void> {
    if (this.database) {
      return;
    }

    try {
      const db = await this.sqlite.create({
        name: this.dbName,
        location: this.dbLocation
      });
      this.database = db;
      await this.createTables();
    } catch (error) {
      alert('Error creating database:\n' + JSON.stringify(error));
    }
  }

  private async createTables() {
    await this.query(this.queries.user());
    await this.query(this.queries.token());
    await this.query(this.queries.products());
    await this.query(this.queries.units());
    await this.query(this.queries.shoppingLists());
    await this.query(this.queries.items());
  }

  private async query(query: string): Promise<any> {
    await this.createDatabaseIfNotReady();

    console.log(query);
    return this.database.executeSql(query, []).catch(e => {
      alert(`Error executing query:\n${query}\nError:\n` + JSON.stringify(e));
    });
  }

  private getWhereQuerySegment(
    glue: string,
    column: string,
    value: string | boolean | null
  ) {
    if (value === null) {
      return `${glue} ${column} IS NULL`;
    }

    return `${glue} ${column} = ` + this.parseInsertOrUpdateValue(value);
  }

  private parseInsertOrUpdateValue(value) {
    if (value === null) {
      return `${value}`.toUpperCase();
    }

    if (value === false || value === true || typeof value === 'number') {
      return `${+value}`;
    }

    return `"${value}"`;
  }

  protected resourceIsRemote(resource: { remote_id: number }) {
    return !resource.remote_id ? false : true;
  }

  public async select<T = any>(
    where: any = {},
    withTrashed: boolean = false
  ): Promise<T[]> {
    if (!where) {
      where = {};
    }

    let query = `SELECT * FROM ${this.table}`;
    if (!withTrashed) {
      where.deleted_at = null;
    }

    Object.keys(where).forEach((column, index) => {
      const value = where[column];
      let glue = 'AND';
      if (index === 0) {
        glue = 'WHERE';
      }

      query += ' ' + this.getWhereQuerySegment(glue, column, value);
    });

    return this.query(query).then(data => {
      const rows = data.rows;
      const mapped: T[] = [];
      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          mapped.push(rows.item(i));
        }
      }
      return mapped;
    });
  }

  public async find<T = any>(id: number): Promise<T> {
    const data = await this.select<T>({ id });
    return data[0];
  }

  public async findByName<T = any>(name: string): Promise<T> {
    const data = await this.select<T>({ name });
    return data[0];
  }

  public async findByRemoteId<T = any>(remote_id: number): Promise<T> {
    const data = await this.select<T>({ remote_id });
    return data[0];
  }

  public async first<T = any>(): Promise<T> {
    const data = await this.select<T>();
    return data[0];
  }

  public async insert(row: any, timestamp: boolean = true): Promise<void> {
    if (timestamp === true) {
      delete row.created_at;
    }

    let columns = '';
    let values = '';
    Object.keys(row).forEach(column => {
      const value = row[column];
      let parsedValue = this.parseInsertOrUpdateValue(value);

      if (column === 'id') {
        return;
      }

      if (timestamp === true) {
        if (column === 'remote_id') {
          return;
        }

        if (column === 'created_at') {
          parsedValue = 'datetime()';
        }
      }

      columns += `${column}, `;
      values += `${parsedValue}, `;
    });

    if (timestamp === true) {
      columns += 'created_at, ';
      values += 'datetime(), ';
    }

    columns = columns.trim().replace(/,+$/, '');
    values = values.trim().replace(/,+$/, '');

    const query = `INSERT INTO ${this.table} (${columns}) VALUES (${values})`;
    this.query(query);
  }

  public async update(
    id: number,
    row: any,
    timestamp: boolean = true
  ): Promise<void> {
    this.updateBy('id', id, row, timestamp);
  }

  public async updateBy(
    column: string,
    value: number | string | boolean,
    row: any,
    timestamp: boolean = true
  ): Promise<void> {
    if (timestamp === true) {
      delete row.updated_at;
    }

    let set = '';
    Object.keys(row).forEach(column => {
      const value = row[column];
      let parsedValue = this.parseInsertOrUpdateValue(value);

      if (column === 'id') {
        return;
      }

      if (timestamp === true) {
        if (column === 'remote_id') {
          return;
        }

        if (column === 'updated_at') {
          parsedValue = 'datetime()';
        }
      }

      set += `${column} = ${parsedValue}, `;
    });

    set = set.trim().replace(/,+$/, '');

    if (typeof value !== 'number') {
      value = `"${value}"`;
    }
    const query = `UPDATE ${this.table} SET ${set} WHERE ${column} = ${value}`;
    this.query(query);
  }

  public async delete(id: number): Promise<void> {
    this.deleteBy('id', id);
  }

  public async batchDelete(ids: number[]): Promise<void> {
    this.batchDeleteBy('id', ids);
  }

  public async deleteBy(
    column: string,
    value: string | number | boolean
  ): Promise<void> {
    if (typeof value !== 'number') {
      value = `"${value}"`;
    }
    const query = `UPDATE ${this.table} SET deleted_at = datetime() WHERE ${column} = ${value}`;
    this.query(query);
  }

  public async batchDeleteBy(
    column: string,
    values: string[] | number[] | boolean[]
  ): Promise<void> {
    let valueString = '';
    values.forEach(value => {
      valueString += this.parseInsertOrUpdateValue(value) + ', ';
    });
    valueString = valueString.trim().replace(/,+$/, '');
    const query = `UPDATE ${this.table} SET deleted_at = datetime() WHERE ${column} IN (${valueString})`;
    this.query(query);
  }

  public async forceDelete(id: number): Promise<void> {
    this.forceDeleteBy('id', id);
  }

  public async forceDeleteBy(
    column: string,
    value: string | number | boolean
  ): Promise<void> {
    const query = `DELETE FROM ${this.table} WHERE ${column} = ${value}`;
    this.query(query);
  }

  public async truncate(): Promise<void> {
    const query = `DELETE FROM ${this.table}`;
    this.query(query);
  }
}
