import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueriesService {
  private create = 'CREATE TABLE IF NOT EXISTS';

  constructor() {}

  users(): string {
    return (
      this.create +
      ' user ' +
      '(' +
      'id INTEGER PRIMARY KEY,' +
      'email varchar(255),' +
      'password varchar(255),' +
      'token varchar(255),' +
      'offline_only TINYINT(1)' +
      ')'
    );
  }

  shoppingLists(): string {
    return (
      this.create +
      ' shopping_lists ' +
      '(' +
      'id INTEGER PRIMARY KEY,' +
      'remote_id INTEGER UNIQUE,' +
      'name varchar(255),' +
      'created_at TIMESTAMP,' +
      'updated_at TIMESTAMP,' +
      'deleted_at TIMESTAMP' +
      ')'
    );
  }

  products(): string {
    return (
      this.create +
      ' products ' +
      '(' +
      'id INTEGER PRIMARY KEY,' +
      'remote_id INTEGER UNIQUE,' +
      'name varchar(255),' +
      'user_id INTEGER,' +
      'created_at TIMESTAMP,' +
      'updated_at TIMESTAMP,' +
      'deleted_at TIMESTAMP' +
      ')'
    );
  }

  units(): string {
    return (
      this.create +
      ' units ' +
      '(' +
      'id INTEGER PRIMARY KEY,' +
      'remote_id INTEGER UNIQUE,' +
      'name varchar(255),' +
      'user_id INTEGER,' +
      'created_at TIMESTAMP,' +
      'updated_at TIMESTAMP,' +
      'deleted_at TIMESTAMP' +
      ')'
    );
  }

  items(): string {
    return (
      this.create +
      ' items ' +
      '(' +
      'id INTEGER PRIMARY KEY,' +
      'remote_id INTEGER UNIQUE,' +
      'shopping_list_id INTEGER,' +
      'product_id INTEGER,' +
      'unit_id INTEGER,' +
      'user_id INTEGER,' +
      'amount INTEGER,' +
      'done TINYINT(1),' +
      'created_at TIMESTAMP,' +
      'updated_at TIMESTAMP,' +
      'deleted_at TIMESTAMP' +
      ')'
    );
  }
}
