/* eslint-disable @typescript-eslint/camelcase */
module.exports = [
  {
    script: 'dist/main.js',
    name: 'Ideawake Main',
    exec_mode: 'cluster',
    instances: 0,
    max_restarts: 5,
    restart_delay: 1000,
  },
];
