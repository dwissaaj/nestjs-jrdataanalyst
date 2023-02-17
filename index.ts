const fs = require('fs');
const pg = require('pg');
const url = require('url');

const postgresqlUri =
  'postgres://avnadmin:AVNS_TofanQSOLdCjXNDTAlP@jrdata-postgre-dwisaji150-922f.aivencloud.com:25598/defaultdb?sslmode=require';

const conn = new URL(postgresqlUri);
conn.search = '';

const config = {
  connectionString: conn.href,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('./ca.pem').toString(),
  },
};

const client = new pg.Client(config);
client.connect(function (err) {
  if (err) throw err;
  client.query('SELECT VERSION()', [], function (err, result) {
    if (err) throw err;

    console.log(result.rows[0].version);
    client.end(function (err) {
      if (err) throw err;
    });
  });
});
