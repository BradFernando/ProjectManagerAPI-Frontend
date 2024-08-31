import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchTerm: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchTerm) {
      return items;
    }
    searchTerm = searchTerm.toLowerCase();

    return items.filter(item => {
      return Object.keys(item).some(key => {
        if (item[key] && typeof item[key] === 'string') {
          return item[key].toLowerCase().includes(searchTerm);
        }
        return false;
      });
    });
  }
}
