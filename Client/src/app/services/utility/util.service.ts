import { ActivatedRoute, Router } from '@angular/router';
import {
  COLOR_LIST,
  DATA_TYPES,
  ICON_LIST,
  LINK_SVG,
  REGEX
} from '../../utils';
import {
  find,
  get,
  has,
  includes,
  isEmpty,
  join,
  last,
  split,
  toLower,
  trimStart
} from 'lodash';

import { ApiService } from '../backend.service';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { NgRedux } from '@angular-redux/store';
import { AppState } from 'src/app/store';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  index = 0;
  private defaultLanguage = 'en';
  allBrowserLanguages = ['en', 'itl', 'de', 'es', 'pt'];

  private IdeaFilterDateOpenClose$: BehaviorSubject<
    boolean
  > = new BehaviorSubject(false);
  copyToClipboard(value: string): void {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = value;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  async downloadFile(file) {
    const blob = await fetch(file.url, {
      headers: {
        Accept: '*/*',
        'Cache-Control': 'max-age=0',
        Connection: 'keep-alive',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36'
      }
    }).then((r) => r.blob());

    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = file.name;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  isEmail(mail: string): boolean {
    return new RegExp(REGEX.email).test(mail);
  }

  getUrlPreview(url) {
    return this.apiService.get('/meta/getmeta', url);
  }

  async processCommentMentions(comment = {}, mentionsData = []) {
    const id = get(comment, 'id', 0);
    const message = get(comment, 'message', '');
    const mentions = get(comment, 'mentions', []);
    const tags = get(comment, 'tags', []);
    const mentionedData = has(mentionsData, id) ? mentionsData[id] : [];
    const words = message.split(' ');
    let mentionIndex = 0;
    // process urls
    let urlsMeta = [];
    const urls = message.match(/\bhttps?:\/\/\S+/gi);
    if (urls && urls.length) {
      urlsMeta = await this.apiService
        .get('/meta/getmeta', { url: join(urls, ',') })
        .toPromise()
        .then((res: any) => res.response);
    }
    // process urls end
    for (let j = 0; j < words.length; j++) {
      if (words[j][0] === '@' && has(mentions, mentionIndex)) {
        const temp = mentions[mentionIndex++];
        if (temp) {
          words[j] =
            `<a href="/profile/view/${temp.mentionedObjectId}">` +
            words[j] +
            '</a>';
        }
      } else if (words[j][0] === '#') {
        words[j] = `<a href="/search">${words[j]}</a>`;
      } else if (words[j].match(/(https?:\/\/[^\s]+)/g)) {
        const currentUrl = words[j];
        const favicon = get(urlsMeta[currentUrl], 'favicon', LINK_SVG);
        const title = get(urlsMeta[currentUrl], 'title', currentUrl);
        words[j] = `<a href="${words[j]}" target="_blank">
            <img height="15" width="15" src="${favicon}"> ${title}/>
          </a>`;
      }
    }
    return words.join(' ');
  }

  async processMentions(
    str: string,
    mentions: Array<string>,
    tags: Array<string>
  ) {
    const words = str.split(' ');
    let mentionIndex = 0;
    if (!mentions) {
      mentions = [];
    }
    // process urls
    let urlsMeta = [];
    const urls = str.match(/\bhttps?:\/\/\S+/gi);
    if (urls && urls.length) {
      urlsMeta = await this.apiService
        .get('/meta/getmeta', { url: join(urls, ',') })
        .toPromise()
        .then((res: any) => res.response);
    }
    // process urls end
    for (let j = 0; j < words.length; j++) {
      if (words[j][0] === '@') {
        words[j] = `<a href="/profile/view/${mentions[mentionIndex++]}">${
          words[j]
        }</a>`;
      } else if (words[j][0] === '#') {
        words[j] = `<a href="/search">${words[j]}</a>`;
      } else if (words[j].match(/(https?:\/\/[^\s]+)/g)) {
        const currentUrl = words[j];
        const favicon = get(urlsMeta[currentUrl], 'favicon', LINK_SVG);
        const title = get(urlsMeta[currentUrl], 'title', currentUrl);
        words[j] = `<a href="${words[j]}" target="_blank">
            <img height="15" width="15" src="${favicon}"> ${title}/>
          </a>`;
      }
    }
    return words.join(' ');
  }

  navigateTo(queryParams): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams
    });
  }

  replaceUrls(value): string {
    return value.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) =>
        url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0]
    );
  }

  precisionTo(num, precision = 2) {
    const factor = Math.pow(10, precision);
    const n = precision < 0 ? num : 0.01 / factor + num;
    return Math.round(n * factor) / factor;
  }

  cleanObject(params) {
    const queryParams = {};
    if (!isEmpty(params) && params !== undefined) {
      for (const key of Object.keys(params)) {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== 'null' &&
          params[key] !== 'undefined'
        ) {
          if (Array.isArray(params[key])) {
            if (params[key].length) {
              queryParams[key] = params[key];
            }
          } else {
            if (
              !(
                typeof params[key] === DATA_TYPES.OBJECT && isEmpty(params[key])
              )
            ) {
              queryParams[key] = params[key];
            }
          }
        }
      }
    }
    return queryParams;
  }

  changeColor(i) {
    return COLOR_LIST[i];
  }

  isEmpty(myObject) {
    for (const key in myObject) {
      if (myObject.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  getFileIcon(file) {
    let returningIcon = file.url;
    file.name = trimStart(last(split(file.url, '/')), '0123456789');
    file.extension = last(split(file.name, '.'));

    if (toLower(file.attachmentType) !== 'image') {
      const iconType = ICON_LIST[toLower(file.attachmentType)];
      if (iconType) {
        if (typeof iconType === DATA_TYPES.STRING) {
          returningIcon = iconType;
        } else {
          const icon = iconType[toLower(file.extension)];
          if (icon) {
            returningIcon = icon;
          } else {
            returningIcon = ICON_LIST.other;
          }
        }
      } else {
        returningIcon = ICON_LIST.other;
      }
    }
    return returningIcon;
  }

  private getViewerLink(fileLink) {
    return `${environment.documentViewer}${fileLink}`;
  }

  openFile(file) {
    let link;
    const docExt = ['docx', 'pptx', 'xlsx', 'doc', 'xls', 'ppt'];
    if (includes(docExt, file.extension)) {
      link = this.getViewerLink(file.url);
    } else {
      link = file.url;
    }
    window.open(link, '_blank');
  }
  getIdeaFilterDateDropdownEmitter(): Observable<boolean> {
    return this.IdeaFilterDateOpenClose$.asObservable();
  }

  setIdeaFilterDateDropdownEmitter(flag: boolean) {
    this.IdeaFilterDateOpenClose$.next(flag);
  }
  getTranslation(str) {
    let language = this.ngRedux.getState().DynamicTranslationState.settings
      .language;
    if (!language) {
      language = this.defaultLanguage;
    }
    if (!includes(this.allBrowserLanguages, language)) {
      language = this.defaultLanguage;
    }
    if (language == 'itl') {
      language = 'it';
    }
    let data = { q: [str], target: language };
    return this.apiService.post('/translation/get-translation', data);
  }
}
