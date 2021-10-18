export const environment = {
  production: true,
  backendApiUrl: 'https://api.ideawake.com',
  domainName: 'ideawake.com',
  socket: {
    settingsSocket: 'https://api.ideawake.com:2083/invite',
    insightsSocket: 'https://api.ideawake.com:4200/insights',
    commentThreadSocket: 'https://api.ideawake.com:2083/comment-thread',
    actionItemNotificationSocket:
      'https://notifications.ideawake.com:2087/action-item-log',
    activityLogSocket: 'https://notifications.ideawake.com:2087/activity-log'
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
