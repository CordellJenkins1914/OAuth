import express from 'express';
const router = express.Router();
import axios from 'axios';
import 'dotenv/config';
import { stringify } from 'querystring';
import { query } from 'express-validator';
import { sanitize } from '../utils/sanitization.js';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECTURI  = process.env.REDIRECTURI;

const codeMin = 32;
const codeMax = 64;


// Validate the Authorization Code sent from Zoom
const validateQuery = [
    query('code')
        .isString()
        .withMessage('code must be a string')
        .isLength({ min: codeMin, max: codeMax })
        .withMessage(`code must be > ${codeMin} and < ${codeMax} chars`)
        .escape(),
    query('state')
        .isString()
        .withMessage('state must be a string')
        .custom((value, { req }) => value === req.session.state)
        .withMessage('invalid state parameter')
        .escape(),
];

router.get('/login', (req, res) => {
    const query = new URLSearchParams()

    query.set('client_id', CLIENT_ID);
    query.set('response_type', 'code');
    query.set('redirect_uri', REDIRECTURI);

    const url = new URL('https://zoom.us/oauth/authorize')

    url.search = query.toString()
    
    res.redirect(url.toString());

})

router.get('/callback', async(req, res) => {
    
    sanitize(req);
    const code = req.query.code || null;
    //res.cookie("code", code, { httpOnly: true })

    axios.request({
        method: 'post',
        url: 'https://zoom.us/oauth/token',
        data: stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECTURI
        }),
        headers: {
            'content_type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
    })
        .then(response => {                
                const {access_token, token_type, refresh_token, expires_in} = response.data;
                req.session.refreshToken = refresh_token;
                req.session.accessToken = access_token;
                req.session.expires_in = expires_in;
                req.session.tokenType = token_type;
                

                const queryParams = stringify({
                    access_token,
                    refresh_token,
                    expires_in,
                  });
          
                  res.redirect(`http://localhost:3000/?${queryParams}`);

        })
        .catch(error => {
                res.send(error);
            });
        });

router.get('/user', async (req, res) => {
    axios.get('https://api.zoom.us/v2/users/me', {
        headers: {
            Authorization: `${req.session.tokenType} ${req.session.accessToken}`
        }
    })  
    .then(response => {
        res.send(response.data);
    }).catch(error => {
        res.send(error);
    });
});

router.get('/getMeetingList', async(req, res) => {
    axios.get('https://api.zoom.us/v2/users/me/meetings', {
        headers: {
            Authorization: `${req.session.tokenType} ${req.session.accessToken}`
        }
    })  
    .then(response => {
        res.send(response.data);
    }).catch(error => {
        res.send(error);
    });
});

router.get('/refresh_token', async (req, res) => {
    axios({
        method: 'post',
        url: 'https://zoom.us/oauth/token',
        data: stringify({
            grant_type: 'refresh_token',
            refresh_token: req.session.refreshToken
        }),
        headers: {
            'content_type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
    }).then(response => {    
        if(response.status === 200){        
            let {access_token, token_type, refresh_token, expires_in} = response.data;
            req.session.refreshToken = refresh_token;
            req.session.accessToken = access_token;
            req.session.tokenType = token_type;
            req.session.expires_in = expires_in;

            const responseData = {
                access_token : req.session.accessToken,
                refresh_token: req.session.refreshToken,
                expires_in: req.session.expires_in
            
            }
            const jsonContent = JSON.stringify(responseData);
            res.send(jsonContent);
            console.log("We saved the new stuff");
        }
        else{
            res.send(response);
        }
    }).catch(error => {
        console.log(error);
        req.session.refreshToken = "undefined";
        req.session.accessToken = "undefined";
        console.log("Session expired send logout flag");
        const responseData = {
            access_token : req.session.accessToken,
            refresh_token: req.session.refreshToken,
            expires_in: req.session.expires_in
        
        }
        const jsonContent = JSON.stringify(responseData);
        res.send(jsonContent);
    })
});

export default router;