const fs = require('fs')
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const server = jsonServer.create();
const router = jsonServer.router('./db.json')
const middlewares = jsonServer.defaults();
const userdb = JSON.parse(fs.readFileSync('./users.json','UTF-8'))
const db = JSON.parse(fs.readFileSync('./db.json','UTF-8'));
const config = require('./config');
const { check, validationResult,query } = require('express-validator/check');
const tokenList = {}

server.use(jsonServer.defaults());
server.use(bodyParser.urlencoded({extended: true}))
server.use(bodyParser.json())
server.use(middlewares);


function isAuthenticated({email, password}){
    return userdb.users.findIndex(user => user.email === email && user.password === password) !== -1
}

server.get('/test',(req,res)=>{
    res.status(200).json({error:'hi'})
})

server.post('/login',[check('email','email is required').not().isEmpty(),
                      check('password','password is required').not().isEmpty(),
                      check('applicationId','app id is required').optional()
                    ],(req,res)=>{

    let errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).jsonp(errors.array());
    }

    const {email,password,applicationId} = req.body;

    const user = {
        "email":email,
    }
    if (isAuthenticated({email, password}) === false) {
        const status = 404
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

server.post('/token',[check('refreshToken','refresh Token is required').not().isEmpty(),
                    ], (req,res) => {

    let errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).jsonp(errors.array());
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

server.get('/api/locate/order',[query('orderno','must be 10 chars').not().isEmpty().isLength({min:10,max:10}),
                                query('itemno','must be 5 chars').not().isEmpty().isLength({min:5,max:5})],(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).jsonp(errors.array());
    }

    let orderno = req.query.orderno;
    let itemno = req.query.itemno;

    let devices = [];
    db.devices.map(device=>{
    if(device.orderno === orderno && device.itemno === itemno){
        devices.push(device);
    }
    })
    const response = [];
    const devicesneedConfigure = []
    devices.map((device)=>{
        const {status,model,configuredBy,location,deviceIssue,configFileBy} = device;
        if(status !== "configured"){
            devicesneedConfigure.push({model,status})
        }
        response.push({status,model,configuredBy,location,deviceIssue,configFileBy});
    })

    if(response.length!==0){
        res.status(200).json({
            totalDevices: response.length,
            devices:response,
            itemsToConfigure:devicesneedConfigure.length,
            devicesneedConfigure:devicesneedConfigure
        });
    }
    else{
        res.status(404).jsonp({
            error:'Not Found'
        })
    }
})

server.get('/api/configure/device',[query('model').not().isEmpty()],(req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).jsonp(errors.array());
    }
    let model = req.query.model;
    let result = db.devices.find(devices=>{
        if(devices.model === model){
            return devices;
        }
    })
    if(result){
        let {
            deviceconnected,
            validatingfirmware,
            uploadfile,
            rebootdevice } = result;
        let deviceResponse;
        if(deviceconnected === 'error' || validatingfirmware === 'error' || uploadfile === 'error' || rebootdevice === 'error'){
            deviceResponse = 'error';
        }
        else{
            deviceResponse = 'success';
        }
        const response = {
            "deviceconnected": deviceconnected,
            "validatingfirmware": validatingfirmware,
            "uploadfile": uploadfile,
            "rebootdevice": rebootdevice,
            "deviceResponse":deviceResponse
        }
        res.status(200).json(response);
    }
    else{
        res.status(404).jsonp({
            error:'Not Found'
        })
    }
})

server.use(jsonServer.rewriter({
    '/api/search/order?*':'/devices'
}))


server.use(router);

router.render = function (req, res) {
    if (req.url === '/devices' ) {
      const {orderno,itemno} = req.query;
      if(orderno === undefined || orderno === ''){
          return res.status(422).jsonp({error:'orderno must not be empty'});
      }
      if(itemno === undefined || itemno === ''){
          return res.status(422).jsonp({error:'itemno must not be empty'});
      }
      let devices = res.locals.data;
      const response = [];
      const devicesneedConfigure = []
      devices.map((device)=>{
          const {status,model,configuredBy,location,deviceIssue,configFileBy} = device;
          if(status !== "configured"){
            devicesneedConfigure.push({model,status})
            }
          response.push({status,model,configuredBy,location,deviceIssue,configFileBy});
      })
      res.jsonp({
        totalDevices: response.length,
        devices:response,
        itemsToConfigure:devicesneedConfigure.length,
        devicesneedConfigure:devicesneedConfigure
      })
    }
    else{
        res.jsonp({
            devices:res.locals.data
        })
    }
}
server.listen(config.port || process.env.PORT || 3000);

module.exports = server