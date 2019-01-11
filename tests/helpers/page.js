const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build(){
        const browser = await puppeteer.launch({
            headless : true,
            args: ['--no-sandbox'] // test할 때 시간을 많이 줄인다.
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);
        
        return new Proxy(customPage, {
            get: function(target, property){
                // 3개의 다른 오브젝트에 접근할 수 있다.
                return customPage[property] || browser[property]|| page[property];
            }
        })
    }
    constructor(page){
        this.page = page;
    }

    async login(){
        // user Factory를 이용하여 mongo에 사용자를 생성하고, 생성한 user document를 반환 받는다.
        const user = await userFactory();

        // session Factory를 가동시켜 session과 sig를 Object로 반환 받는다.
        const { session, sig } = sessionFactory(user);

        // puppeteer를 이용해 쿠키를 세팅한다.
        await this.page.setCookie({name: 'session', value: session });
        await this.page.setCookie({name: 'session.sig', value: sig});

        // re render 해야지만 cookie에 심긴다.
        await this.page.goto('http://localhost:3000/blogs');

        // 해당 selector가 등장할 때까지 대기한다.
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector){
        return this.page.$eval(selector, el => el.innerHTML);
    }

    get(path){
        return this.page.evaluate(
            (_path) => {
                return fetch(_path, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }).then(res => res.json());
            }, path);
    }

    post(path,data){
        return this.page.evaluate(
            (_path,_data) => {
                return fetch(_path, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify(_data)
                }).then(res => res.json());
            },path,data)
    }

    execRequests(actions) {
        return Promise.all(actions.map(({method, path, data}) => {
            return this[method](path, data);
            // data가 없다면 자동으로 undefined가 되어 Get할 때 data 인자가 들어가지 않는다.
        }))
        // Promise.all는 각 Promise들이 다 반환될 때까지 기다린다.
    }
}

module.exports = CustomPage;
