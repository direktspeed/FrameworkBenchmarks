import h from '../helper.js';
import Sequelize from 'sequelize';
const sequelize = new Sequelize('hello_world', 'benchmarkdbuser', 'benchmarkdbpass', {
  host: 'tfb-database',
  dialect: 'mysql',
  logging: false
});

const Worlds = sequelize.define('World', {
  id: {
    type: 'Sequelize.INTEGER',
    primaryKey: true
  },
  randomNumber: { type: 'Sequelize.INTEGER' }
}, {
    timestamps: false,
    freezeTableName: true
  });

const Fortunes = sequelize.define('Fortune', {
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
}).then(results => results).catch((err) => {
  process.exit(1);
});

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
    }).catch(({stack}) => {
      console.log(stack);
      process.exit(1);
    });
  },

  Updates: (queries, req, res) => {
    const worldPromises = [];

    for (let i = 0; i < queries; i++) {
      worldPromises.push(randomWorldPromise());
    }

    const worldUpdate = (world) => {
      world.randomNumber = h.randomTfbNumber();

      return Worlds.update({
        randomNumber: world.randomNumber
      },
        {
          where: { id: world.id }
        }).then(results => world).catch((err) => {
          process.exit(1);
        });
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
