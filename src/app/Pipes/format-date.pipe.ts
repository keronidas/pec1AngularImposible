import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  transform(value: Date, ...args: number[]): unknown {
    const date = new Date(value);
    let formattedDate = '';

    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    const year = date.getFullYear();
    const format = args[0]; // Obtener el tipo de formato
    switch (format) {
      case 1:
        formattedDate = `${year}${month}${day}`;
        break;
      case 2:
        formattedDate = `${day} / ${month} / ${year}`;
        break;
      case 3:
        formattedDate = `${day}/${month}/${year}`;
        break;
      case 4:
        formattedDate = `${year}-${month}-${day}`;
        break;
      default:
        formattedDate = `${day}/${month}/${year}`;
    }

    return formattedDate;
  }
}