import { ApplicationConfig } from '../config';

export class ResponseHelper {
  static pushInLoader(request) {
    ApplicationConfig.loaderArray.push({
      request
    });
  }

  static popFromLoader(request, response, router, pop) {
    if (pop) {
      ApplicationConfig.loaderArray.pop();
    }
    this.addNotification(request, response, router);
  }

  static incrementInPPDCount() {
    ApplicationConfig.ppdRequestsCount += 1;
  }

  static decrementInPPDCount() {
    ApplicationConfig.ppdRequestsCount -= 1;
  }

  static getPPDCount() {
    return ApplicationConfig.ppdRequestsCount;
  }

  // Add notification to show
  static addNotification(request, response, router) {
    ApplicationConfig.notification = undefined;
    response.status < 400
      ? this.generateSuccessNotification(request)
      : this.generateErrorNotification(request, response, router);
  }

  // Get Internationalized Notification Message
  static getNotification(request) {
    if (request.url.endsWith('.json')) {
      return undefined;
    }
    const i18nKey = this.setI18nKey(request.url, request.url);
    return ApplicationConfig.notificationMessagesList[i18nKey]
      ? ApplicationConfig.notificationMessagesList[i18nKey]
      : undefined;
  }

  static setI18nKey(url, httpType?: string) {
    let key = '';
    key = url.split('?')[0]; // Remove query params
    key = ResponseHelper.replaceAll(key); // replace all id's with 'rel_id'
    key = key.replace(/\//g, '_'); // replace all '/' with '_'
    if (httpType) {
      key = httpType.concat(key);
    }
    return key;
  }

  static replaceAll(key) {
    const regex = /([0-9])*\d+/;
    while (key.match(regex) && key.match(regex).length) {
      key = key.replace(regex, 'relId');
    }
    return key;
  }

  static generateSuccessNotification(request) {
    const notificationMessage = this.getNotification(request);
    if (notificationMessage) {
      // If relevant notification message found
      ApplicationConfig.notification = {
        title: notificationMessage.title,
        message: notificationMessage.success,
        type: 'success'
      };
    }
  }

  static generateErrorNotification(request, response, router) {
    const body = response;
    const addNotification = true;
    if (addNotification) {
      ApplicationConfig.notification = {
        title: 'Error!',
        message: body.error.message,
        type: 'error'
      };
    }

    if (response.status == 401) {
      setTimeout(() => {
        window.localStorage.removeItem('isLoggedIn');
        window.localStorage.removeItem('privileges');
        window.localStorage.removeItem('userInfo');
        router.navigate(['/login']);
        return false;
      }, 1000);
    }
  }

  static customNotification(message, msgTitle, msgType) {
    ApplicationConfig.notification = {
      title: msgTitle,
      message,
      type: msgType
    };
  }
  static getLoaderLength() {
    return ApplicationConfig.loaderArray.length;
  }

  static getSubString(str, start, end, appendTrailingDots = false) {
    return !appendTrailingDots
      ? str.substring(start, end)
      : `${str.substring(start, end)}...`;
  }
}
