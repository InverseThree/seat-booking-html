import dotenv from 'dotenv';

dotenv.config()

if (process.env.CONNECTION_STR === undefined){
  console.log("CONNECTION_STR is not defined");
  process.exit(1);
}

export default {
  // Export variable here
  CONNECTION_STR: process.env.CONNECTION_STR
}
