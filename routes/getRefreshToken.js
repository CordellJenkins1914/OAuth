import axios from 'axios';
import querystring from 'querystring';
import 'dotenv/config';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

async function getRefreshToken(old_refresh_token, req) {
        console.log("in getRefreshToken");
        await axios({
            method: 'post',
            url: 'https://zoom.us/oauth/token',
            data: querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: old_refresh_token
            }),
            headers: {
                'content_type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
            },
        }).then(response => {
            console.log("in getRefreshToken success")
            
            
            let {access_token, token_type, refresh_token} = response.data;
            req.session.refreshToken = refresh_token;
            req.session.accessToken = access_token;
            req.session.tokenType = token_type;
            return;
        
        }).catch(error => {
            console.log(error);
        })
    }
    export default getRefreshToken;