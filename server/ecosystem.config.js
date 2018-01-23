module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name : 'API',
      script : "dist/app.js",
      watch : true
    }
  ]
};
