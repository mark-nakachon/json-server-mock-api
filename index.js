const fs = require('fs')
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const server = jsonServer.create();
const router = jsonServer.router('./db.json')
const middlewares = jsonServer.defaults();
const userdb = JSON.parse(fs.readFileSync('./users.json','UTF-8'))
const config = require('./config');
const { check, validationResult } = require('express-validator');
const tokenList = {}

server.use(jsonServer.defaults());
server.use(bodyParser.urlencoded({extended: true}))
server.use(bodyParser.json())
server.use(middlewares);

function isAuthenticated({email, password,applicationId}){
    return userdb.users.findIndex(user => user.email === email && user.password === password && user.applicationId === applicationId) !== -1
}

server.post('/login',(req,res)=>{
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('applicationId', 'app id is required').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        res.send('There have been validation errors: ' + util.inspect(errors), 400);
        return;
    }
    const {email,password,applicationId} = req.body;

    const user = {
        "email":email,
    }
    if (isAuthenticated({email, password,applicationId}) === false) {
        const status = 401
        const message = 'Incorrect email or password'
        res.status(status).json({status, message})
        return
      }
      const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
      const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife})
      const response = {
          "status": "Logged in",
          "token": token,
          "refreshToken": refreshToken,
      }
      tokenList[refreshToken] = response
      res.status(200).json(response);
    }
)

server.post('/token', (req,res) => {
    // refresh the damn token
    req.checkBody('refreshToken', 'refreshToken is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.send('There have been validation errors: ' + util.inspect(errors), 400);
        return;
    }
    const postData = req.body
    // if refresh token exists
    if((postData.refreshToken) && (postData.refreshToken in tokenList)) {
        const user = {
            "email": postData.email
        }
        const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
        const response = {
            "token": token,
        }
        // update the token in the list
        tokenList[postData.refreshToken].token = token
        res.status(200).json(response);
    } else {
        res.status(404).send('Invalid request')
    }
})
server.use(require('./tokenChecker'))

server.use(router);

//server.use('/api',)
server.listen(config.port || process.env.PORT || 3000);