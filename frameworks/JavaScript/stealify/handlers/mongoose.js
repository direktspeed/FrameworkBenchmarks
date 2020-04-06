import h from '../helper.js';
import async from 'async';
import Mongoose from 'mongoose';
const connection = Mongoose.connect(
  'mongodb://tfb-database/hello_world',
  { useMongoClient: true }
);

// Mongoose Setup
const WorldSchema = new Mongoose.Schema({
  id: Number,
  randomNumber: Number
}, {
    collection: 'world'
  });
const FortuneSchema = new Mongoose.Schema({
  id: Number,
  message: String
}, {
    collection: 'fortune'
  });

const Worlds = connection.model('World', WorldSchema);
const Fortunes = connection.model('Fortune', FortuneSchema);

const mongooseRandomWorld = (callback) => {
  Worlds.findOne({
    id: h.randomTfbNumber()
  }).exec(callback);
};

const mongooseGetAllFortunes = (callback) => {
  Fortunes.find({})
    .exec(callback);
};

export default {

  SingleQuery: (req, res) => {
    mongooseRandomWorld((err, result) => {
      if (err) { return process.exit(1); }

      h.addTfbHeaders(res, 'json');
      res.end(JSON.stringify(result));
    })
  },

  MultipleQueries: (queries, req, res) => {
    const queryFunctions = h.fillArray(mongooseRandomWorld, queries);

    async.parallel(queryFunctions, (err, results) => {
      if (err) { return process.exit(1); }

      h.addTfbHeaders(res, 'json');
      res.end(JSON.stringify(results));
    });
  },

  Fortunes: (req, res) => {
    mongooseGetAllFortunes((err, fortunes) => {
      if (err) { return process.exit(1); }

      fortunes.push(h.additionalFortune());
      fortunes.sort(({message}, {message}) => message.localeCompare(message));
      h.addTfbHeaders(res, 'html');
      res.end(h.fortunesTemplate({
        fortunes
      }))
    });
  },

  Updates: (queries, req, res) => {
    const selectFunctions = h.fillArray(mongooseRandomWorld, queries);

    async.parallel(selectFunctions, (err, worlds) => {
      if (err) { return process.exit(1); }

      const updateFunctions = [];

      for (let i = 0; i < queries; i++) {
        ((i) => {
          updateFunctions.push((callback) => {
            worlds[i].randomNumber = h.randomTfbNumber();
            Worlds.update({
              id: worlds[i].id
            }, {
                randomNumber: worlds[i].randomNumber
              }, callback);
          });
        })(i);
      }

      async.parallel(updateFunctions, (err, results) => {
        if (err) { return process.exit(1); }

        h.addTfbHeaders(res, 'json');
        // results does not have updated document information
        // if no err: all updates were successful
        res.end(JSON.stringify(worlds));
      });
    });
  }

};
