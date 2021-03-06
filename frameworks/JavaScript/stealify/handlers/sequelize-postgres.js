import h from '../helper.js';
import Sequelize from 'sequelize';
const sequelize = new Sequelize('hello_world', 'benchmarkdbuser', 'benchmarkdbpass', {
  host: 'tfb-database',
  dialect: 'postgres',
  logging: false,
  pool: {
    min: 20, max: 20
  }
});

const Worlds = sequelize.define('world', {
  id: {
    type: 'Sequelize.INTEGER',
    primaryKey: true
  },
  randomnumber: { type: 'Sequelize.INTEGER' }
}, {
    timestamps: false,
    freezeTableName: true
  });

const Fortunes = sequelize.define('fortune', {
  id: {
    type: 'Sequelize.INTEGER',
    primaryKey: true
  },
  message: { type: 'Sequelize.STRING' }
}, {
    timestamps: false,
    freezeTableName: true
  });

const randomWorldPromise = () => Worlds.findOne({
  where: { id: h.randomTfbNumber() }
}).then(results => results).catch((err) => process.exit(1));

export default {

  SingleQuery: (req, res) => {
    randomWorldPromise().then((world) => {
      h.addTfbHeaders(res, 'json');
      res.end(JSON.stringify(world));
    });
  },

  MultipleQueries: (queries, req, res) => {
    const worldPromises = [];

    for (let i = 0; i < queries; i++) {
      worldPromises.push(randomWorldPromise());
    }

    Promise.all(worldPromises).then((worlds) => {
      h.addTfbHeaders(res, 'json');
      res.end(JSON.stringify(worlds));
    });
  },

  Fortunes: (req, res) => {
    Fortunes.findAll().then((fortunes) => {
      fortunes.push(h.additionalFortune());
      fortunes.sort(({message}, {message}) => message.localeCompare(message));

      h.addTfbHeaders(res, 'html');
      res.end(h.fortunesTemplate({
        fortunes
      }));
    }).catch((err) => process.exit(1));
  },

  Updates: (queries, req, res) => {
    const worldPromises = [];

    for (let i = 0; i < queries; i++) {
      worldPromises.push(randomWorldPromise());
    }

    const worldUpdate = (world) => {
      world.randomnumber = h.randomTfbNumber();

      return Worlds.update({
        randomnumber: world.randomnumber
      },
        {
          where: { id: world.id }
        }).then(results => world).catch((err) => process.exit(1));
    };

    Promise.all(worldPromises).then((worlds) => {
      const updates = worlds.map((e) => worldUpdate(e));

      Promise.all(updates).then((updated) => {
        h.addTfbHeaders(res, 'json');
        res.end(JSON.stringify(updated));
      });
    });
  }

};
