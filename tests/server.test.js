const server = require('../index');
const supertest = require('supertest');
const request = supertest(server);
const config = require('./config');
const faker = require('faker');

let token,refreshToken;

beforeAll((done) => {
  request
    .post('/login')
    .send({
      email: config.email,
      password:config.password
    })
    .end((err, response) => {
      token = response.body.token; // save the token!
      refreshToken = response.body.refreshToken
      done();
    });
});

describe('POST /login',()=>{
    //-pass email and password correcty should respond with 200
    test('It responds with JSON',async (done)=>{
        const response = await request.post('/login')
                        .send({
                            email:config.email,
                            password:config.password,
                        })
        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        done()
        })
    //send email and password as empty
    test('It responds with unprocessable entry',async (done)=>{
        const response = await request.post('/login')
                               .send({
                                   email:'',
                                   password:''
                               })
        expect(response.status).toBe(422);
        done()
    })
    //send email and passwords that are not in users.json (404 NOT Found)

    test('It responds with Not Found',async (done)=>{
        const response = await request.post('/login')
                               .send({
                                   email:faker.internet.email(),
                                   password:faker.internet.password()
                               })
        expect(response.status).toBe(404);
        done()
    })
})

describe('POST /token',()=>{
    //send refresh token  200
    test('It responds with JSON',async (done)=>{
        const response = await request.post('/token')
                        .send({
                            refreshToken:refreshToken
                        })
        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        done()
        })
    //send refresh token as empty
    test('It responds with unprocessable entry',async (done)=>{
        const response = await request.post('/token')
                               .send({
                                   refreshToken:''
                               })
        expect(response.status).toBe(422);
        done()
    })
})


describe('GET /api/configure/device',()=>{
    // token not sent should respond with 403
    test('It should require token for authorization',async (done)=>{
       const response = await request.get(`/api/configure/device?model=${config.model}`);
       expect(response.status).toBe(403);
       done()
    })
    //send token with correct query parameter model - should respond with 200
    test('It responds with JSON',async (done)=>{
        const response = await request.get(`/api/configure/device?model=${config.model}`)
                        .set('x-access-token',token)
        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        done()
        })
    //send query parameter model parameter as empty
    test('It responds with unprocessable entry',async (done)=>{
        const response = await request.get('/api/configure/device?model=')
                               .set('x-access-token',token)
        expect(response.status).toBe(422);
        done()
    })
    //send query param model that does not exist in the db.json (404 NOT Found)

    test('It responds with Not Found',async (done)=>{
        const response = await request.get('/api/configure/device?model=123eqecqw')
                               .set('x-access-token',token)
        expect(response.status).toBe(404);
        done()
    })
})

describe('GET /api/locate/order',()=>{
    // token not sent should respond with 403
    test('It should require token for authorization',async (done)=>{
       const response = await request.get(`/api/locate/order?orderno=${config.orderno}&itemno=${config.itemno}`);
       expect(response.status).toBe(403);
       done()
    })
    //send token with correct query parameters orderno and itemno - should respond with 200
    test('It responds with JSON',async (done)=>{
        const response = await request.get(`/api/locate/order?orderno=${config.orderno}&itemno=${config.itemno}`)
                        .set('x-access-token',token)
        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        done()
        })
    //send query parameters orderno and itemno  as empty
    test('It responds with unprocessable entry',async (done)=>{
        const response = await request.get('/api/locate/order?orderno=&itemno=')
                               .set('x-access-token',token)
        expect(response.status).toBe(422);
        done()
    })
    //send query params orderno and itemno that does not exist in the db.json and are invalid (404 NOT found)
    test('It responds with Not Found',async (done)=>{
        const response = await request.get(`/api/locate/order?orderno=${faker.random.alphaNumeric ((number = 10))}&itemno=${faker.random.alphaNumeric((number=5))}`)
                               .set('x-access-token',token)
        expect(response.status).toBe(404);
        done()
    })
    //send query params orderno and itemno with more than limited chars (422 unable to process request)
     test('It responds with unprocessable entry if more than 10,5 chars are provided',async (done)=>{
        const response = await request.get(`/api/locate/order?orderno=${faker.random.alphaNumeric ((number = 5))}&itemno=${faker.random.alphaNumeric((number=10))}`)
                               .set('x-access-token',token)
        expect(response.status).toBe(422);
        done()
    })
})

describe('GET /api/search/order',()=>{
    // token not sent should respond with 403
    test('It should require token for authorization',async (done)=>{
       const response = await request.get(`/api/search/order?orderno=${config.orderno}&itemno=${config.itemno}&model_like=rs`);
       expect(response.status).toBe(403);
       done()
    })
    //send token with correct query parameters orderno and itemno & search criteria- should respond with 200
    test('It responds with JSON',async (done)=>{
        const response = await request.get(`/api/search/order?orderno=${config.orderno}&itemno=${config.itemno}&model_like=${config.model}`)
                        .set('x-access-token',token)
        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        done()
        })
    //send token with correct query parameters orderno and itemno & search criteria - should respond with 200
    test('It responds with JSON',async (done)=>{
        const response = await request.get(`/api/search/order?orderno=${config.orderno}&itemno=${config.itemno}&IpAddress_like=${config.ipaddress}`)
                        .set('x-access-token',token)
        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        done()
        })
    //send query parameters orderno and itemno  as empty
    test('It responds with unprocessable entry',async (done)=>{
        const response = await request.get('/api/search/order?orderno=&itemno=&model_like=rs')
                               .set('x-access-token',token)
        expect(response.status).toBe(422);
        done()
    })
})










