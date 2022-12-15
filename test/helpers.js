import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/app.js';

chai.use(chaiHttp);

global.request = chai.request(app).keepOpen();
global.should = chai.should();
