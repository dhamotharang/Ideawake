import * as _ from 'lodash';
import { SCREEN_TYPES, SCREEN_SIZES } from './constants';
import { DisplayOptions } from './models';

// @dynamic
export class Utility {
  response: any;
  private static defaultOption: DisplayOptions = {
    display: false,
    mobileRender: false,
    webRender: false
  };

  getResponse(object: {} | any) {
    const res = object.response;
    if (res.meta && (res.meta.status === 200 || res.meta.status === 204)) {
      this.response = res.response;
      return this.response;
    } else {
      return undefined;
    }
  }

  /*
  cleanPostParams(model: any) {
    const params = {};
    for (const key in model) {
      let defined = true;
      if (!model[key]) {
        defined = false;
      } else if (model[key] === null || model[key] === 'null') {
        defined = false;
      } else if (model[key] === '') {
        defined = false;
      } else if (Array.isArray(model[key]) && !(model[key].length > 0)) {
        defined = false;
      }

      if (typeof model[key] === DATA_TYPES.BOOLEAN) {
        defined = true;
      }

      if (defined === true) {
        if (Array.isArray(model[key])) {
          params[key] = model[key];
        } else if (typeof model[key] === DATA_TYPES.OBJECT) {
          this.cleanPostObject(params, model, key);
        } else {
          params[key] = model[key].toString();
        }
      }
    }
    return params;
  } */

  cleanPostObject(params, model, key) {
    // Skip Null/Invalid values
    for (const index in model[key]) {
      if (!model[key][index]) {
        delete model[key][index];
      }
    }
    params[key] = model[key];
  }

  cleanObject(params, model, key) {
    // Skip Null/Invalid values
    for (const index in model[key]) {
      if (!model[key][index]) {
        delete model[key][index];
      }
    }
    if (Object.keys(model[key]).length) {
      params[key] = JSON.stringify(model[key]);
    }
  }

  trimValue(val) {
    return val.indexOf(',') > -1 ? val.slice(0, 20) : val.slice(0, 13);
  }

  getNestedParamValue(keyToMap, model) {
    if (model[keyToMap[0]]) {
      const temp = model[keyToMap[0]];
      let finalValue = null;
      for (const value of keyToMap) {
        if (temp[value]) {
          finalValue = temp[value];
        }
      }
      return finalValue;
    } else {
      return null;
    }
  }

  cleanEditPostParams(model) {
    const params = {};
    for (const key in model) {
      if (Array.isArray(model[key])) {
        params[key] = model[key];
      } else if (model[key] === 'null') {
        params[key] = null;
      } else {
        params[key] = model[key];
      }
    }
    return params;
  }

  static linkify(plainText): string {
    let replacedText;
    let replacePattern1;
    let replacePattern2;
    let replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = plainText.replace(
      replacePattern1,
      '<a href="$1" target="_blank">$1</a>'
    );

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(
      replacePattern2,
      '$1<a href="http://$2" target="_blank">$2</a>'
    );

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(
      replacePattern3,
      '<a href="mailto:$1">$1</a>'
    );

    return replacedText;
  }

  static replaceWithComma(value) {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  /**
   * Get screen type
   * @returns {SCREEN_TYPES} Screen Type Enumeration
   */
  static get screenType(): SCREEN_TYPES {
    return (
      SCREEN_SIZES.find(
        (x) =>
          (x.min ? window.innerWidth >= x.min : true) &&
          (x.max ? window.innerWidth < x.max : true)
      ).screen || SCREEN_TYPES.WEB
    );
  }

  /**
   * Set Screen Option object based on screen size
   * @param DisplayOptions  which is an interface.
   */
  static setDisplayOptions(
    option: DisplayOptions = this.defaultOption
  ): DisplayOptions {
    if (option.display) {
      if (!option.webRender && this.screenType == SCREEN_TYPES.WEB) {
        option.webRender = true;
      } else if (
        !option.mobileRender &&
        this.screenType == SCREEN_TYPES.MOBILE
      ) {
        option.mobileRender = true;
      }
    }
    return option;
  }
}
