import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { QueriesService } from './queries.service';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private dbName = 'shoppinglist.db';
  private dbLocation = 'default';
  private database: SQLiteObject;
  private currentTable: string;

  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private queries: QueriesService
  ) {
    this.platform
      .ready()
      .then(() => {
        this.createDB();
      })
      .catch(error => {
        console.log(error);
      });
  }

  use(table: string) {
    if (this.currentTable !== table) {
      this.currentTable = table;
    }
  }

  private async query(query: string): Promise<any> {
    console.log(query);
    return this.database.executeSql(query, []).catch(e => {
      alert(`Error executing query:\n${query}\nError:\n` + JSON.stringify(e));
    });
  }

  async createDB(): Promise<void> {
    this.sqlite
      .create({
        name: this.dbName,
        location: this.dbLocation
      })
      .then((db: SQLiteObject) => {
        this.database = db;
        this.createTables();
      })
      .catch(e => {
        alert('error createDB ' + JSON.stringify(e));
      });
  }

  async createTables(): Promise<void> {
    this.query(this.queries.user());
    this.query(this.queries.token());
    this.query(this.queries.products());
    this.query(this.queries.units());
    this.query(this.queries.shoppingLists());
    this.query(this.queries.items());
  }

  async select<T>(where?: string, withTrashed?: boolean): Promise<T[]> {
    if (!this.currentTable) {
      console.log('No table selected!');
      return;
    }
    let query = `SELECT * FROM ${this.currentTable}`;
    if (where) {
      query += ` WHERE ${where}`;
      if (!withTrashed) {
        query += ' AND deleted_at IS NULL';
      }
    } else if (!withTrashed) {
      query += ' WHERE deleted_at IS NULL';
    }
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

  async find<T>(id: number): Promise<T> {
    const data = await this.select<T>(`id = ${id}`);
    return data[0];
  }

  async findByName<T>(name: string): Promise<T> {
    const data = await this.select<T>(`name = ${name}`);
    return data[0];
  }

  async findByRemoteId<T>(id: number): Promise<T> {
    const data = await this.select<T>(`remote_id = ${id}`);
    return data[0];
  }

  async first<T>(): Promise<T> {
    const data = await this.select<T>();
    return data[0];
  }

  async insert(row: any, timestamp: boolean = true): Promise<void> {
    if (!this.currentTable) {
      alert('No table selected!');
      return;
    }

    if (timestamp === true) {
      delete row.created_at;
    }

    let columns = '';
    let values = '';
    Object.keys(row).forEach(key => {
      if (key === 'id') {
        return;
      } else if (
        row[key] === null ||
        row[key] === false ||
        row[key] === true ||
        typeof row[key] === 'number'
      ) {
        columns += `${key},`;
        values += `${row[key]},`;
      } else if (
        (key === 'remote_id' || key === 'created_at') &&
        timestamp === true
      ) {
        return;
      } else {
        columns += `${key},`;
        values += `"${row[key]}",`;
      }
    });

    if (timestamp === true) {
      columns += 'created_at,';
      values += 'datetime(),';
    }

    columns = columns.replace(/,+$/, '');
    values = values.replace(/,+$/, '');

    const query = `INSERT INTO ${this.currentTable} (${columns}) VALUES (${values})`;
    this.query(query);
  }

  async update(id: number, row: any, timestamp: boolean = true): Promise<void> {
    this.updateBy('id', id, row, timestamp);
  }

  async updateBy(
    column: string,
    value: number | string | boolean,
    row: any,
    timestamp: boolean = true
  ): Promise<void> {
    if (!this.currentTable) {
      alert('No table selected!');
      return;
    }

    if (timestamp === true) {
      delete row.updated_at;
    }

    let set = '';
    Object.keys(row).forEach(key => {
      if (key === 'id') {
        return;
      } else if (
        (key === 'remote_id' || key === 'updated_at') &&
        timestamp === true
      ) {
        return;
      } else if (
        row[key] === null ||
        row[key] === false ||
        row[key] === true ||
        typeof row[key] === 'number'
      ) {
        set += `${key} = ${row[key]},`;
      } else {
        set += `${key} = "${row[key]}",`;
      }
    });

    if (timestamp === true) {
      set += 'updated_at = datetime(),';
    }

    set = set.replace(/,+$/, '');

    if (typeof value !== 'number') {
      value = `"${value}"`;
    }
    const query = `UPDATE ${this.currentTable} SET ${set} WHERE ${column} = ${value}`;
    this.query(query);
  }

  async delete(id: number): Promise<void> {
    this.deleteBy('id', id);
  }

  async deleteBy(
    column: string,
    value: string | number | boolean
  ): Promise<void> {
    if (typeof value !== 'number') {
      value = `"${value}"`;
    }
    const query = `UPDATE ${this.currentTable} SET deleted_at = datetime() WHERE ${column} = ${value}`;
    this.query(query);
  }

  async forceDelete(id: number): Promise<void> {
    this.forceDeleteBy('id', id);
  }

  async forceDeleteBy(
    column: string,
    value: string | number | boolean
  ): Promise<void> {
    const query = `DELETE FROM ${this.currentTable} WHERE ${column} = ${value}`;
    this.query(query);
  }

  async truncate(): Promise<void> {
    const query = `DELETE FROM ${this.currentTable}`;
    this.query(query);
  }
}
