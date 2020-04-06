import h from '../helper.js';
import async from 'async';
import mysql from 'mysql';
const connection = mysql.createConnection({
  host: 'tfb-database',
  user: 'benchmarkdbuser',
  password: 'benchmarkdbpass',
  database: 'hello_world'
});
import NodeCache from "node-cache";
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

let cachePopulated = false;

connection.connect();

const queries = {
  GET_RANDOM_WORLD: () => `SELECT * FROM world WHERE id = ${h.randomTfbNumber()}`,
  ALL_FORTUNES: "SELECT * FROM fortune",
  ALL_WORLDS: "SELECT * FROM world",
  UPDATE_WORLD: rows => [
    "UPDATE world SET randomNumber = ", rows[0].randomNumber,
    " WHERE id = ", rows[0]['id']
  ].join('')
};

const populateCache = (callback) => {
  if (cachePopulated) return callback();
  connection.query(queries.ALL_WORLDS, (err, rows) => {
    rows.forEach(({id, randomNumber}) => myCache.set(id, { id, randomNumber }));
    cachePopulated = true;
    callback();
  });
};

const mysqlRandomWorld = (callback) =>
  connection.query(queries.GET_RANDOM_WORLD(), (err, rows, fields) => {
    callback(err, rows[0]);
  });

const mysqlGetAllFortunes = (callback) =>
  connection.query(queries.ALL_FORTUNES, (err, rows, fields) => {
    callback(err, rows);
  });

const mysqlUpdateQuery = (callback) =>
  connection.query(queries.GET_RANDOM_WORLD(), (err, rows, fields) => {
    if (err) { return process.exit(1); }

    rows[0].randomNumber = h.randomTfbNumber();
    const updateQuery = queries.UPDATE_WORLD(rows);

    connection.query(updateQuery, (err, result) => {
      callback(err, rows[0]);
    });
  });

export default {

  SingleQuery: (req, res) => {
    mysqlRandomWorld((err, result) => {
      if (err) { return process.exit(1); }

      h.addTfbHeaders(res, 'json');
      res.end(JSON.stringify(result));
    });
  },

  MultipleQueries: (queries, req, res) => {
    const queryFunctions = h.fillArray(mysqlRandomWorld, queries);

    async.parallel(queryFunctions, (err, results) => {
      if (err) { return process.exit(1); }

      h.addTfbHeaders(res, 'json');
      res.end(JSON.stringify(results));
    });
  },

  CachedQueries: (queries, req, res) => {
    populateCache(() => {
      let worlds = [];
      for (let i = 0; i < queries; i++) {
        const key = `${h.randomTfbNumber()}`;
        worlds.push(myCache.get(key));
      }

      h.addTfbHeaders(res, 'json');
      res.end(JSON.stringify(worlds));
    });
  },

  Fortunes: (req, res) => {
    mysqlGetAllFortunes((err, fortunes) => {
      if (err) { return process.exit(1); }

      fortunes.push(h.additionalFortune());
      fortunes.sort(({message}, {message}) => message.localeCompare(message));
      h.addTfbHeaders(res, 'html');
      res.end(h.fortunesTemplate({
        fortunes
      }));
    });
  },

  Updates: (queries, req, res) => {
    const queryFunctions = h.fillArray(mysqlUpdateQuery, queries);

    async.parallel(queryFunctions, (err, results) => {
      if (err) { return process.exit(1); }

      h.addTfbHeaders(res, 'json');
      res.end(JSON.stringify(results));
    });
  }

};
