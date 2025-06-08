import dotenv from 'dotenv';
dotenv.config();

import initMongoConnection from './src/db/initMongoConnection.js';
import setupServer from './src/server.js';

const start = async () => {
  await initMongoConnection();
  setupServer();
};

start();
