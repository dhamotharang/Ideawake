// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  backendApiUrl: 'http://172.18.1.16:3000',
  domainName: 'ideawake.com',
  socket: {
    settingsSocket: 'http://172.18.1.16:3000/invite',
    insightsSocket: 'http://172.18.1.16:3000/insights',
    commentThreadSocket: 'http://172.18.1.16:4300/comment-thread',
    actionItemNotificationSocket: 'http://172.18.1.16:4300/action-item-log',
    activityLogSocket: 'http://172.18.1.16:4301/activity-log'
  },
  mapbox: {
    accessKey:
      'pk.eyJ1IjoiaXNmYW5ka2hhbiIsImEiOiJjazliYm1ub3AyY2ppM2twZ2RzYXNsbzF5In0.DSLHuqMvTKy6AfVSr_VrDA'
  },
  flatFile: {
    licenceKey: 'f4573585-50ec-49db-b2a7-db3a50a6f366'
  },
  documentViewer: `https://view.officeapps.live.com/op/embed.aspx?src=`
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
