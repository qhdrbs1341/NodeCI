const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
    // 1. 오류가 날 것이다. Jest는 테스트 파일 외 다른 파일들은 실행시키지 않는다.
    // 그러므로 Mongoose Connection이 정의된 index.js도 실행시키지 않는다.
    return new User({}).save();
}
