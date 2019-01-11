const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
// hget으로 바뀌었다.
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true; // 해당 쿼리 객체만 useCache가 true 된다.
    // 객체에 options 객체의 키 값을 저장시킨다. 없으면 ''
    this.hashKey = JSON.stringify(options.key || '');

    return this;
}

mongoose.Query.prototype.exec = async function (){
    const key = JSON.stringify(Object.assign({},this.getQuery(), {collection: this.mongooseCollection.name}));
    // 이 쿼리 객체의 useCache가 false라면 .cache()로 호출한 게 아니므로 정상적인 db 쿼리를 실행한다. (캐시 로직 없음)
    if(!this.useCache){
        return exec.apply(this, arguments);
    }
    // redis에 Value가 있는지 검사
    const cacheValue = await client.hget(this.hashKey,key);

    // 있으면 리턴해준다.
    if(cacheValue){
        /*
        doc = new this.model(JSON.parse(cacheValue)); // Model 객체, Document로 만들어 반환해야 한다.
        return doc; // 그냥 JSON.parse된 오브젝트로 해봤자, 몽고는 못 읽음.
        // 이렇게 해도 레디스에서 받아온 cacheValue는 array of object이기에 못 읽음.
        */
       const doc = JSON.parse(cacheValue);
       return Array.isArray(doc) 
       ? doc.map(d => new this.model(d)) // 배열 안 요소들을 각 각 model instance로 만든다.
       : new this.model(doc); // 그냥 object를 model instance로 만든다 
    }
    // 없으면 쿼리를 발생시키고, redis에 저장시킨다.
    const result = await exec.apply(this,arguments);
    client.hset(this.hashKey, key,JSON.stringify(result),'EX',10);
    return result;
}

module.exports = {
  clearHash(hashKey){
      client.del(JSON.stringify(hashKey));
  }  
};
