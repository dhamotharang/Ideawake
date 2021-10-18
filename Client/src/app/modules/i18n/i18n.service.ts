import { get, includes } from 'lodash';
import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

const allBrowserLanguages = ['en', 'itl', 'de', 'es', 'pt'];

@Injectable()
export class I18nService {
  private subject = new Subject<any>();

  public data = null;
  public currentLanguage: any;
  private defaultLanguage = 'en';

  constructor() {
    let language = localStorage.getItem('language');
    if (!language) {
      language = this.defaultLanguage;
    }
    if (!includes(allBrowserLanguages, language)) {
      language = this.defaultLanguage;
    }
    this.setLanguage(language);
  }

  public getTranslation(phrase: string) {
    return get(this.data, phrase) || phrase;
  }

  public setLanguage(language) {
    this.data = require(`./translation-files/${language}.json`);
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    this.sendUpdate(language);
  }

  sendUpdate(language: string) {
    this.subject.next({ language });
  }

  getLanguageUpdates(): Observable<any> {
    return this.subject.asObservable();
  }
}
