const mongoose = require("mongoose");

let connectionPromise = null;

async function connectMongo(uri = process.env.MONGO_URI) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!uri) {
    throw new Error("MONGO_URI is not configured.");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri);
    connectionPromise.catch(() => {
      connectionPromise = null;
    });
  }

  await connectionPromise;
  return mongoose.connection;
}

module.exports = {
  mongoose,
  connectMongo
};
