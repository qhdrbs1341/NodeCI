const Page = require('./helpers/page');

let page;

beforeEach(async() => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async() => {
    await page.close();
});



// 해당 케이스들 마다 구별해서, 테스트를 실행한다.
describe('When logged in', async() => {
    // 이 안에 테스트 함수들에 대해서만 적용되는 beforeEach()
    beforeEach(async()=>{
        await page.login();
        await page.click('a.btn-floating');
    })

    test('can see blog create form', async()=>{
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('And using valid inputs', async () => {
        beforeEach(async() => {
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');
            await page.click('form button');
        })
        test('Submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });
        test('Submitting then saving adds blog to index page', async() => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual('My Title');
            expect(content).toEqual('My Content');
        });
    })

    describe('And using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');
            
            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        })
    })
})

describe('User is not logged in', async () => {
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'T',
                content: 'C'
            }
        }
    ]
    test('Blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions);
        // for ( let element of array )는 배열 안에 각 element들이 담긴다.
        for(let result of results){
            expect(result).toEqual({error: 'You must log in!'});
        }
    })
});
