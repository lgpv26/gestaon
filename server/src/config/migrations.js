const config = require('index.js')
const mysqlConnectionConfig = {
    username: config.database.user,
    password: config.database.password,
    database: config.database.dbName,
    host: config.database.host,
    dialect: config.database.dialect
}
module.exports = {
    development: mysqlConnectionConfig,
    production: mysqlConnectionConfig
}