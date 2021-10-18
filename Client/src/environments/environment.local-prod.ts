export const environment = {
  production: true,
  backendApiUrl: 'http://localhost:3000',
  domainName: 'localhost',
  socket: {
    settingsSocket: 'http://localhost:4300/invite',
    insightsSocket: 'http://localhost:4200/insights',
    commentThreadSocket: 'http://localhost:4300/comment-thread',
    actionItemNotificationSocket: 'http://localhost:4301/action-item-log',
    activityLogSocket: 'http://localhost:4301/activity-log'
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
