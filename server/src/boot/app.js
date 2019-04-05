// imports
const config = require("../config/index");

/*const PrettyLogger = require('pretty-logger'), log = new PrettyLogger()*/
const mongoose = require("mongoose");
const bluebird = require("bluebird");
const chalk = require("chalk");
const log = console.log;

// in-source imports
const { BootError } = require("~errors");
// dependency injection initialization
const DI = require("./di");
const di = new DI();

async function start() {
  try {
    // overall setup
    await di.initializeSentry();
    await di.setInnkeeper();
    await di.setFirebaseAdmin();
    await di.setRedis();
    await di.setRSMQ();
    await di.setSocketIO();
    await di.setSequelize();
    await di.setVersion();
    await di.setOAuth2();
    await di.setMoleculer();
    await di.setFCM();
    await di.setGoogleApi();

    // attach models to di.server
    await di.attachModels("mysql"); // attached to di.server.mysql.{modelName}
    await di.attachModels("draft-form", "", "models"); // attached to server.draftFormModels.{modelName}

    // loading all sockets
    log(chalk.gray("Loading sockets"));
    const Socket = require("../events");
    new Socket(di.server);

    // loading all http request routes
    log(chalk.gray("Loading routes"));
    require("../routes")(di.server);

    // load services (Moleculer)
    await di.brokerCreateService();

    // initialize tracker protocols
    log(chalk.gray("Loading gps protocols"));
    await di.gpsProtocols();

    // initialize cronjob
    log(chalk.gray("Loading CronJob"));
    await di.cronJob();

    // try to connect to MySQL and create database if it was not found

    const connectToMySQL = new Promise((resolve, reject) => {
      const mysqlConnection = require("mysql").createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password
      });
      let databaseCreated = false;
      mysqlConnection.connect(err => {
        if (err) return reject(err);
        mysqlConnection.query(
          "CREATE DATABASE `" + config.database.dbName + "`;",
          function(err) {
            mysqlConnection.end(function(connectionReleaseError) {
              log(chalk.magenta("Connection check ended and released"));
              if (err) {
                log(
                  chalk.blue(
                    "Using existent " +
                      chalk.black.bold.bgBlue(
                        " " + config.database.dbName + " "
                      ) +
                      " MySQL database"
                  )
                );
                return resolve(databaseCreated);
              }
              log(
                chalk.yellow(
                  "MySQL database " +
                    chalk.black.bold.bgYellow(
                      " " + config.database.dbName + " "
                    ) +
                    " created"
                )
              );
              databaseCreated = true;
              resolve(databaseCreated);
            });
          }
        );
      });
    });

    const connectToRedis = new Promise((resolve, reject) => {
      if (config.redis.active) {
        di.server.redisClient.on("ready", () => {
          log(chalk.green("Successfully connected to Redis server"));
          resolve();
        });
        di.server.redisClient.on("error", err => {
          log(
            chalk.red(
              new BootError(
                "Redis is not connected! Message: " +
                  err.message +
                  " (" +
                  err.name +
                  ")"
              )
            )
          );
          resolve();
        });
      } else resolve();
    });

    if (process.env.NODE_ENV === "production") {
      log(chalk.blue("Starting production server"));
    } else {
      log(chalk.blue("Starting development server"));
    }

    // starts callback chain until server starts, or shutdown if the procedure fails
    di.server.broker
      .start()
      .then(() => {
        di.server.broker.call("socket.cleanRedis").then(() => {
          connectToMySQL.then(databaseCreated => {
            // guarantee MySQL structure
            return di.server.sequelize
              .authenticate({
                logging: false
              })
              .then(() => {
                log(chalk.green("Successfully connected to MySQL server"));
                return new Promise((resolve, reject) => {
                  if (databaseCreated) {
                    return require("~utils/first-seed.js")(di.server)
                      .then(() => {
                        resolve();
                      })
                      .catch(err => {
                        reject(err);
                      });
                  }
                  return resolve();
                }).then(() => {
                  // mongoose.Promise = bluebird
                  // let mongoDbCredentials = {}
                  // if(process.env.NODE_ENV === 'production'){
                  //     mongoDbCredentials = {
                  //         auth: {
                  //             user: config.mongoDb.user,
                  //             password: config.mongoDb.password
                  //         }
                  //     }
                  // }
                  return connectToRedis.then(() => {
                    // return mongoose.connect('mongodb://' + config.mongoDb.host + '/'+ config.mongoDb.dbName, {
                    //     promiseLibrary: bluebird,
                    //     ...mongoDbCredentials
                    // }).then(() => {
                    //log(chalk.green("Successfully connected to MongoDB server"))
                    // finally, initialize di.server
                    di.server.listen(config.mainServer.port, () => {
                      log(
                        chalk.blue(
                          "Server " +
                            chalk.black.bold.bgBlue(
                              " v" + config.mainServer.version + " "
                            ) +
                            " running on port: " +
                            chalk.black.bold.bgBlue(
                              " " + config.mainServer.port + " "
                            )
                        )
                      );
                    });
                    // })
                  });
                });
              })
              .catch(err => {
                log(new BootError(err.message + " (" + err.name + ")"));
              });
          });
        });
      })
      .catch(err => {
        log(new BootError(err.message + " (" + err.name + ")"));
      });
  } catch (error) {}
}
start();
