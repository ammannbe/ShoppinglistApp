import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilHelperService {
  constructor() {}

  parseAndTrim(str: string): string {
    if (str === null || str === undefined || !str.length) {
      str = '';
    }
    return str.trim();
  }

  sort(item: any): any {
    return this.sortBy('name', item);
  }

  sortBy(sort: string, item: any): any {
    return item.sort((a: any, b: any) => {
      return ('' + a[sort]).localeCompare(b[sort]);
    });
  }
}
