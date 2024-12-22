const pg = require('pg');
require('dotenv').config();

const { Client } = pg
const client = new Client();

const setUpDatabase = async () => {
  await client.connect();
  const res = await client.query('SELECT color FROM colors')
  console.log(res.fields);
}

setUpDatabase();
