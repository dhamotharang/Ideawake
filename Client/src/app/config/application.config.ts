// @dynamic
export class ApplicationConfig {
  static translateServiceInstance: any;
  static defaultLanguage = 'en';
  static currentLanguage = 'en';

  static notification; // Global Notifications to show
  static notificationMessagesList = {};
  static loaderArray = [];
  static ppdRequestsCount = 0; // COUNT FOR IN PROGRESS POST, PUT, DELETE REQUESTS

  static setTranslateServiceInstance(instance) {
    ApplicationConfig.translateServiceInstance = instance;
  }

  static getCurrentLang() {
    return ApplicationConfig.currentLanguage;
  }

  static setCurrentLang(lang) {
    ApplicationConfig.currentLanguage = lang;
  }
}
