module.exports = {
    apps: [{
      script: 'index.js',
      //PM2 supports restarting a Node.js application once a memory threshold is reached. This can help prevent a "heap out of memory error" where the application's memory usage exceeds what the system can allocate.
      // max_memory_restart: '1G',
      //    cron_restart: '0 */24 * * *',
      ignore_watch: ['node_modules'],
      //  watch_delay: 1000,
      // restart_delay: 5000, // wait for five seconds before restarting
      // exp_backoff_restart_delay: 100 // Instead of setting a fixed delay before restarting the application, you can use the exp_backoff_restart_delay option to incrementally raise the time between restarts up to 15 seconds. The initial delay time set through this option, and it will be multiplied by 1.5 after each restart attempt
      //    max_restarts: 16,
      //    min_uptime: 5000,
      autorestart: false,
      watch: false,
      name: "xterm",
      instances: 4,
      exec_mode: "cluster",
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: "development"
      },
      env_test: {
        NODE_ENV: "test"
      },
      env_configure: {
        NODE_ENV: "configure"
      }
    }],
    //pm2 start app.js --watch --ignore-watch="public"
  };
  