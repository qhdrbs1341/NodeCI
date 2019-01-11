const { clearHash } = require('../services/cache');

module.exports = async (req,res,next) => {
    await next(); // 이전 route 핸들러에서 next()가 넘어올 때까지 기다린다.
    clearHash(req.user.id); // 그제서야 cleanHash 실행
}
