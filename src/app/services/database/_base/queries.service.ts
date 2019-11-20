import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueriesService {
  private create = 'CREATE TABLE IF NOT EXISTS';
  private drop = 'DROP TABLE';

  constructor() {}

  user(): string {
    // return `${this.drop} user`; // For debugging only
    return (
      this.create +
      ' user ' +
      '(' +
      'id INTEGER PRIMARY KEY,' +
      'email varchar(255),' +
      'password varchar(255),' +
      'offline_only TINYINT(1),' +
      'created_at TIMESTMAP,' +
      'updated_at TIMESTMAP,' +
      'deleted_at TIMESTAMP' +
      ')'
    );
  }

  token(): string {
    // return `${this.drop} token`; // For debugging only
    return (
      this.create +
      ' token ' +
      '(' +
      'token varchar(255),' +
      'expires_at TIMESTMAP,' +
      'issued_at TIMESTMAP,' +
      'created_at TIMESTMAP,' +
      'updated_at TIMESTMAP,' +
      'deleted_at TIMESTAMP' +
      ')'
    );
  }

  products(): string {
    // return `${this.drop} products`; // For debugging only
    return (
      this.create +
      ' products ' +
      '(' +
      'id INTEGER PRIMARY KEY,' +
      'name varchar(255),' +
      'is_public TINYINT(1),' +
      'created_at TIMESTAMP,' +
      'updated_at TIMESTAMP,' +
      'deleted_at TIMESTAMP' +
      ')'
    );
  }

  units(): string {
    // return `${this.drop} units`; // For debugging only
    return (
      this.create +
      ' units ' +
      '(' +
      'id INTEGER PRIMARY KEY,' +
      'name varchar(255),' +
      'created_at TIMESTAMP,' +
      'updated_at TIMESTAMP,' +
      'deleted_at TIMESTAMP' +
      ')'
    );
  }

  shoppingLists(): string {
    // return `${this.drop} shopping_lists`; // For debugging only
    return (
      this.create +
      ' shopping_lists ' +
      '(' +
      'id INTEGER PRIMARY KEY,' +
      'remote_id INTEGER UNIQUE,' +
      'owner_email varchar(255),' +
      'name varchar(255),' +
      'created_at TIMESTAMP,' +
      'updated_at TIMESTAMP,' +
      'deleted_at TIMESTAMP' +
      ')'
    );
  }

  items(): string {
    // return `${this.drop} items`; // For debugging only
    return (
      this.create +
      ' items ' +
      '(' +
      'id INTEGER PRIMARY KEY,' +
      'remote_id INTEGER UNIQUE,' +
      'shopping_list_id INTEGER,' +
      'product_name VARCHAR(255),' +
      'unit_name VARCHAR(255),' +
      'creator_email VARCHAR(255),' +
      'amount INTEGER,' +
      'done TINYINT(1),' +
      'created_at TIMESTAMP,' +
      'updated_at TIMESTAMP,' +
      'deleted_at TIMESTAMP,' +
      'FOREIGN KEY(shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE' +
      ')'
    );
  }
}
