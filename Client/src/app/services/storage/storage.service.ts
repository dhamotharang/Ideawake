import { DATA_TYPES } from '../../utils';
import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {
  private user;
  private readonly localStorage;

  constructor() {
    this.localStorage = window.localStorage;
  }

  private isEmpty(obj: any): boolean {
    if (obj === null || obj === undefined || obj === '') {
      return true;
    }

    if (obj instanceof Array) {
      return !(obj.length > 0);
    }

    if (typeof obj === DATA_TYPES.OBJECT) {
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return false;
        }
      }

      return JSON.stringify(obj) === JSON.stringify({});
    }

    return false;
  }

  setItem(key: string, value: any) {
    let item;
    if (typeof value === DATA_TYPES.OBJECT) {
      item = JSON.stringify(value);
    }
    this.localStorage.setItem(key, item || value);
  }

  getItem(key: string) {
    const data = this.localStorage.getItem(key);
    try {
      const parsedData = this.isEmpty(data)
        ? null
        : this.isEmpty(JSON.parse(data))
        ? data
        : JSON.parse(data);
      return parsedData;
    } catch (err) {
      return data;
    }
  }

  clearItem(key: string) {
    this.localStorage.removeItem(key);
  }

  clearAll() {
    return this.localStorage.clear();
  }

  getUser() {
    if (!this.user) {
      this.user = this.getItem('user');
    }
    return this.user;
  }
}

/* import { Injectable } from '@angular/core';
import * as crypto from 'crypto-js';

@Injectable()
export class StorageService {
  private readonly localStorage;
  private user;
  private readonly RSA_KEY = '123456$#@$^@1ERF';
  private readonly keys = crypto.enc.Utf8.parse(this.RSA_KEY);
  private readonly RSA_CONFIG = {
    keySize: 128 / 8,
    iv: crypto.enc.Utf8.parse(this.RSA_KEY),
    mode: crypto.mode.CBC,
    padding: crypto.pad.Pkcs7
  };

  constructor() {
    this.localStorage = window.localStorage;
  }

  private isEmpty(obj: any): boolean {
    if (obj === null || obj === undefined || obj === '') {
      return true;
    }

    if (obj instanceof Array) {
      return !(obj.length > 0);
    }

    if (typeof obj === DATA_TYPES.OBJECT) {
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return false;
        }
      }

      return JSON.stringify(obj) === JSON.stringify({});
    }

    return false;
  }

  setItem(key: string, value: any) {
    let item;
    if (typeof value === DATA_TYPES.OBJECT) {
      item = JSON.stringify(value);
    }

    this.localStorage.setItem(
      key,
      crypto.AES.encrypt(
        crypto.enc.Utf8.parse(item || value),
        this.keys,
        this.RSA_CONFIG
      )
    );

    this.localStorage.setItem(key, item || value);
  }

  getItem(key: string) {
    let data = crypto.AES.decrypt(
      this.localStorage.getItem(key),
      this.keys,
      this.RSA_CONFIG
    ).toString(crypto.enc.Utf8);

    try {
      const parsedData = this.isEmpty(data)
        ? null
        : this.isEmpty(JSON.parse(data))
        ? data
        : JSON.parse(data);
      return parsedData;
    } catch (err) {
      return data;
    }
  }

  clearItem(key: string) {
    this.localStorage.removeItem(key);
  }

  clearAll() {
    return this.localStorage.clear();
  }

  getUser() {
    if (!this.user) {
      this.user = this.getItem('currentUserId');
    }
    return this.user;
  }
}
 */
