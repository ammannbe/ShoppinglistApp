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

  async createDB(): Promise<void> {
    this.sqlite
      .create({
        name: this.dbName,
        location: this.dbLocation
      })
      .then((db: SQLiteObject) => {
        this.database = db;
        // // NOTE: drop table for test purposes
        // this.database.executeSql('DROP TABLE todoitems').then((result) => {
        //   console.log('dropped');
        // }).catch((err) => {
        //   alert(err);
        // });
        this.createTables();
      })
      .catch(e => {
        alert('error createDB ' + JSON.stringify(e));
      });
  }

  async createTables(): Promise<void> {
    this.database.executeSql(this.queries.user(), []).catch(e => {
      alert('error; createTables; user ' + JSON.stringify(e));
    });
    this.database.executeSql(this.queries.token(), []).catch(e => {
      alert('error; createTables; token ' + JSON.stringify(e));
    });
    this.database.executeSql(this.queries.shoppingLists(), []).catch(e => {
      alert('error; createTables; shoppingLists ' + JSON.stringify(e));
    });
    this.database.executeSql(this.queries.products(), []).catch(e => {
      alert('error; createTables; products ' + JSON.stringify(e));
    });
    this.database.executeSql(this.queries.units(), []).catch(e => {
      alert('error; createTables; units ' + JSON.stringify(e));
    });
    this.database.executeSql(this.queries.items(), []).catch(e => {
      alert('error; createTables; items ' + JSON.stringify(e));
    });
  }

  async select<T>(where?: string): Promise<any> {
    if (!this.currentTable) {
      console.log('No table selected!');
      return;
    }
    let query = `SELECT * FROM ${this.currentTable}`;
    if (where) {
      query += ` WHERE ${where} AND deleted_at IS NULL`;
    } else {
      query += ' WHERE deleted_at IS NULL';
    }
    console.log(query);
    return this.database
      .executeSql(query, [])
      .then(data => {
        const rows = data.rows;
        const mapped: T[] = [];
        if (rows.length > 0) {
          for (let i = 0; i < rows.length; i++) {
            mapped.push(rows.item(i));
          }
        }
        return mapped;
      })
      .catch(e => {
        alert('error ' + JSON.stringify(e));
      });
  }

  async find<T>(id: number): Promise<any> {
    const data = await this.select<T>(`id = ${id}`);
    return data[0];
  }

  async first<T>(): Promise<any> {
    const data = await this.select<T>();
    return data[0];
  }

  async findByRemoteId<T>(id: number): Promise<any> {
    const data = await this.select<T>(`remote_id = ${id}`);
    return data[0];
  }

  async insert(columns: string, values: string): Promise<void> {
    if (!this.currentTable) {
      alert('No table selected!');
      return;
    }

    const query = `INSERT INTO ${this.currentTable} (${columns}) VALUES (${values})`;
    console.log(query);
    this.database.executeSql(query, []).catch(e => {
      alert('error ' + JSON.stringify(e));
    });
  }

  async update(id: number, set: string): Promise<void> {
    const query = `UPDATE ${this.currentTable} SET ${set}, updated_at = 'datetime()' WHERE id = ${id}`;
    console.log(query);
    this.database.executeSql(query, []).catch(e => {
      alert('error ' + JSON.stringify(e));
    });
  }

  async delete(id: number): Promise<void> {
    this.deleteBy('id', id);
  }

  async deleteBy(
    column: string,
    value: string | number | boolean
  ): Promise<void> {
    const query = `UPDATE ${this.currentTable} SET deleted_at = 'datetime()' WHERE ${column} = ${value}`;
    console.log(query);
    this.database.executeSql(query, []).catch(e => {
      alert('error ' + JSON.stringify(e));
    });
  }

  async forceDelete(id: number): Promise<void> {
    this.forceDeleteBy('id', id);
  }

  async forceDeleteBy(
    column: string,
    value: string | number | boolean
  ): Promise<void> {
    const query = `DELETE FROM ${this.currentTable} WHERE ${column} = ${value}`;
    console.log(query);
    this.database.executeSql(query, []).catch(e => {
      alert('error ' + JSON.stringify(e));
    });
  }
}
