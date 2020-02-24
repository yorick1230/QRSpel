var config = {};

config.db = "qrspel";
config.host = "localhost";
config.port = "27017";

config.dbUrl = `mongodb://${config.host}:${config.port}/${config.db}`;

module.exports = config;