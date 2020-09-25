import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueriesService {
  private create = 'CREATE TABLE IF NOT EXISTS';
  // private drop = 'DROP TABLE';

  public products(): string {
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

  public units(): string {
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

  public shoppingLists(): string {
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

  public items(): string {
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
