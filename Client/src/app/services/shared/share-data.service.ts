import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {
  rowsToPrint;
  constructor() {
    this.rowsToPrint = [];
  }

  setRowsToPrint(x) {
    this.rowsToPrint = x;
  }

  pushRowsToPrint(x) {
    this.rowsToPrint.push(x);
  }
  getRowsToPrint() {
    return this.rowsToPrint;
  }
}
