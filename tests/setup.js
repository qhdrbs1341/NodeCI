jest.setTimeout(30000);
// 기본적으로 jest는 5초가 넘어가면 실패로 인식하는데, 그 시간을 임의로 조정

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;
//mongoose connection을 생성
mongoose.connect(keys.mongoURI, { useMongoClient : true});
