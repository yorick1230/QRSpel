var config = {};

config.db = process.env.database;
config.user = process.env.user;
config.host = process.env.host;
config.pass = process.env.pass;

config.dbUrl = `mongodb+srv://${config.user}:${config.pass}@${config.host}/${config.db}?retryWrites=true&w=majority`;
// example from mongodb: mongodb+srv://user:password@host/dbname?retryWrites=true&w=majority

module.exports = config;