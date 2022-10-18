import express from 'express';
const router = express.Router();
import querystring from 'querystring';
import axios from 'axios';
import 'dotenv/config';
import getUser from './getUser.js';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECTURI  = process.env.REDIRECTURI;

router.get('/login', (req, res) => {
    const queryParams = querystring.stringify({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECTURI,
    });
    let url = 'https://zoom.us/oauth/authorize?response_type=code&client_id=' + CLIENT_ID + '&redirect_uri=' + REDIRECTURI;
    res.redirect(url);
    
})

router.get('/callback', async(req, res) => {
    const code = req.query.code || null;
    //res.cookie("code", code, { httpOnly: true })
    axios({
        method: 'post',
        url: 'https://zoom.us/oauth/token',
        data: querystring.stringify({
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
            if(response.status === 200){
                const {access_token, token_type, refresh_token} = response.data;
                let counter = 0;
                req.session.refreshToken = refresh_token;
                req.session.accessToken = access_token;
                req.session.counter = counter;
                req.session.tokenType = token_type;
                res.redirect('/user');

                
            }
        })
        .catch(error => {
                res.send(error);
            });
        });

router.get('/user', async (req, res) => {
    getUser(req,res);
});




export default router;