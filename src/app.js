import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';
import './database.js';
import productsRouter from './routes/product.router.js';
import viewsRouter from './routes/views.router.js';
import cartRouter from './routes/cart.router.js';
import sessionRouter from './routes/session.router.js';
import userRouter from './routes/user.router.js';
import emailRouter from './routes/email.router.js';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import notFoundHandler from './middlewares/notfoundHandler.js';
import config from './config/config.js';
import cors from 'cors';
import compression from 'express-compression';
import errorHandler from './middlewares/errorHandler.js';
import addLogger from './utils/logger.js';
/* swagger */
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

const app = express();

//3) Crear un objeto de configuracion: swaggerOptions

const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Documentacion de la App Ecommerce Analogue',
      description:
        'App especializada en la venta de productos analógicos de diseño',
    },
  },
  apis: ['./src/docs/*.yaml'],
};

//4) Conectamos Swagger a nuestro servidor de Express:

const specs = swaggerJSDoc(swaggerOptions);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

/* middlewares */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(addLogger);
app.use(express.static('./src/public'));
app.use(cookieParser());
app.use(
  session({
    secret: 'secretCoder',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(cors());
app.use(
  compression({
    brotli: { enabled: true, zlib: {} },
  })
);
initializePassport();

/* handlebars */
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

/* routes */
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartRouter);
app.use('/api/users', userRouter);
app.use('/api/sessions', sessionRouter);
app.use('/email', emailRouter);
app.use('*', notFoundHandler);
app.use(errorHandler);

/* Route to test Logger */
app.get('/loggertest', (req, res) => {
  req.logger.http('Mensaje HTTP');
  req.logger.info('Mensaje INFO');
  req.logger.warning('Mensaje WARNING');
  req.logger.error('Mensaje ERROR');

  res.send('Logs generados');
});

console.log('Server time:', new Date());

/* listen */
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
