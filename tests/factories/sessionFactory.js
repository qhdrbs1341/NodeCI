const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);
// 한번만 requirer가 동작하게끔 exports 함수 밖에 선언
module.exports = (user) => {
    // mongo User model에 새로운 유저를 생성해서 매개 변수에 들어올 것이다.
    const sessionObject = {
        passport: {
            // mongo의 user._id는 object다. String으로 바꾸자.
            user: user._id.toString()
        }
    };
    // keygrip을 통해 session sig를 만들기 위해 stringify 시킨다.
    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
    const sig = keygrip.sign('session='+session);
    return { session, sig };
};
