const puppeteer = require('puppeteer');

const Page = require('./helpers/page');

let page;

// jest는 "각" 테스트 함수가 실행되기 전에 beforeEach 함수가 실행된다.
beforeEach(async ()=>{
    // static 메소드인 build()를 실행해서 new 키워드로 인스턴스를 생성하지 않았다!!
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

// jest의 모든 테스트 함수가 실행을 마치고 나서 동작한다.
afterEach(async ()=>{
    // page에도 close() 메소드가 있어서 browser.close()가 실행되지 않는다.
    await page.close();
})

test('the header has the correct text',async ()=>{
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
})

// test('clicking login starts oauth flow',async ()=>{
//     await page.click('.right a');
//     const url = await page.url();
//     expect(url).toMatch(/accounts\.googe\.com/);
// });

// test.only()를 하먼 해당 함수만 테스트한다.
test('When signed in, shows logout button', async()=>{
    await page.login();
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
    expect(text).toEqual('Logout');
})
