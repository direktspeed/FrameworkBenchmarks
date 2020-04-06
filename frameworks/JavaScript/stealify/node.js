import cluster from 'cluster';
import { cpus } from 'os';

import {createServer} from 'http'
import parseurl from 'parseurl'  // faster than native nodejs url package ???
import Handlebars from 'handlebars'
import {h, responses } from './helper.js'
const numCPUs = cpus().length;

process.env.NODE_HANDLER = 'mongodb-raw' //'mysql-raw';

if (process.env.TFB_TEST_NAME === 'nodejs-mongodb') {
  process.env.NODE_HANDLER = 'mongoose';
} else if (process.env.TFB_TEST_NAME === 'nodejs-mongodb-raw') {
  process.env.NODE_HANDLER = 'mongodb-raw';
} else if (process.env.TFB_TEST_NAME === 'nodejs-mysql') {
  process.env.NODE_HANDLER = 'sequelize';
} else if (process.env.TFB_TEST_NAME === 'nodejs-postgres') {
  process.env.NODE_HANDLER = 'sequelize-postgres';
}


if (cluster.isMaster) {
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`
  	  A process exit was triggered, most likely due to a failed database action',
      NodeJS test server shutting down now
    `);
    process.exit(1);
  });
} else {
  // Forked workers will run this code when found to not be
// the master of the cluster.




const GREETING = "Hello, World!";

    // Initialize routes & their handlers (once)
    // Intialized database connections, one for each db config
    // * Mongoose is a popular Node/MongoDB driver
    // * Sequelize is a popular Node/SQL driver
    import(`./handlers/${process.env.NODE_HANDLER}.js`).then(({ default: Handler }) => {
        const basicHandler = {
            routes: {
                '/json': responses.jsonSerialization,
                '/plaintext': responses.plaintext,
                '/db': Handler.SingleQuery,
                '/fortunes': Handler.Fortunes,
            },
            has(path) {
                return basicHandler.routes[path];
            },
            handle(path, req, res) {
                basicHandler.routes[path](req, res);
            }
        }
        
        const queryHandler = {
            routes: {
                '/queries': Handler.MultipleQueries,
                '/updates': Handler.Updates,
                '/cached': Handler.CachedQueries,
            },
            has(path) {
                return queryHandler.routes[path];
            },
            handle(path, queries, req, res) {
                queryHandler.routes[path](queries, req, res);
            }
        }
      const routeNotImplemented = (req, res) => {
        res.writeHead(501, {'Content-Type': 'text/plain; charset=UTF-8'});
        const reason = { reason: "`" + req.url + "` is not an implemented route" };
        res.end(JSON.stringify(reason));
      };
    
    createServer((req, res) => {
        const url = parseurl(req);
        const route = url.pathname;
    
        // Routes that do no require a `queries` parameter
        if (basicHandler.has(route)) {
            return basicHandler.routes[route](req, res);
        } else {
            // new URLSearchParams(url.query)
            // naive: only works if there is one query param, as is the case in TFB
            const queries = Math.min(Math.max(~~(url.query && String.prototype.split.apply(url.query,['='])[1]) || 1, 1), 500);
    
            if (queryHandler.has(route)) {
                return queryHandler.routes[route](queries, req, res);
            } else {
                return routeNotImplemented(req, res);
            }
        }
    
    }).listen(8080, () => console.log("NodeJS worker listening on port 8080"));    
    });
    

    

}