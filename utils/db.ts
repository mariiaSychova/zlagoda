const { Client } = require("pg");

export const executeDBQuery = async (query: string) => {
  const client = new Client({
    host: "localhost",
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  await client.connect();

  const result = await client.query(query);

  await client.end();

  return result.rows;
};
