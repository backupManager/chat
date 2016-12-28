import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressValidator from 'express-validator';
import Session from 'express-session';
import morgan from 'morgan';
import mongoose from 'mongoose';
import passport from 'passport';
import { createClient as createRedisClient } from 'redis';
import connectRedis from 'connect-redis';
import Socketio from 'socket.io';
import config from 'config';

import routes from './routes';
import socketConnectionHandler from './sockets';

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3030;

// Hey you! care about my order http://stackoverflow.com/a/16781554/2034015

/*
 * Databases initialization.
 */
// Data database (Mongoose + MongoDB).
const dbHost = config.get('database.data.host');
const dbPort = config.get('database.data.port');
const dbName = config.get('database.data.db');
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${dbHost}:${dbPort}/${dbName}`);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB connection error!'));

// Session database (Redis).
const redisClient = createRedisClient();
const RedisStore = connectRedis(Session);
const dbSession = new RedisStore({
  client: redisClient,
  host: config.get('database.session.host'),
  port: config.get('database.session.port'),
  prefix: config.get('database.session.prefix'),
  disableTTL: true
});

// Cookies.
app.use(cookieParser());

// Body.
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(expressValidator({
  customValidators: {
    isSlug: function (input) {
      if (typeof input !== 'string' ||
          input.length < 5 || input.length > 55) return false;

      const re = /^[a-zA-Z0-9_-]+$/;
      return input.match(re);
    }
  }
}));

// Session.
const session = Session({
  resave: true,
  saveUninitialized: true,
  key: config.get('session.key'),
  secret: config.get('session.secret'),
  store: dbSession
});
app.use(session);

// Passport.
app.use(passport.initialize());
app.use(passport.session());

// Logging (debug only).
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// URLs.
app.use('/', routes);


// Socket.IO
const io = Socketio(server);
io.use((socket, next) => {
  session(socket.handshake, {}, next);
});

io.on('connection', socketConnectionHandler);

// Listen.
server.listen(port);
console.info(`🌐  API + 🗲 Socket listening on port ${port}`);

export default server;