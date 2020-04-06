//import { env } from "deno";
// --allow-env
//const process = { env: env() }

if (process.env.TFB_TEST_NAME === 'nodejs-mongodb') {
    process.env.NODE_HANDLER = 'mongoose';
  } else if (process.env.TFB_TEST_NAME === 'nodejs-mongodb-raw') {
    process.env.NODE_HANDLER = 'mongodb-raw';
  } else if (process.env.TFB_TEST_NAME === 'nodejs-mysql') {
    process.env.NODE_HANDLER = 'sequelize';
  } else if (process.env.TFB_TEST_NAME === 'nodejs-postgres') {
    process.env.NODE_HANDLER = 'sequelize-postgres';
  }