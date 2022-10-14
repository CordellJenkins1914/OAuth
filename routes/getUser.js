import axios from 'axios';
import querystring from 'querystring';
import 'dotenv/config';
import getRefreshToken from './getRefreshToken.js';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

function getUser(req,res) {

    let access_token = req.session.accessToken;
    let counter = req.session.counter;
    let token_type = req.session.tokenType;
    
    if(counter == 0){
        access_token = "expired";
    }
    counter = 1;
    req.session.counter = counter;
    
    axios.get('https://api.zoom.us/v2/users/me', {
        headers: {
            Authorization: `${token_type} ${access_token}`
        }
    })  
    .then(response => {
        console.log("in getUser success");
        res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
    })
    .catch(async error => {
        if(401 == error.response.status) {
            console.log("in getUser fail");
            let refresh_token = req.session.refreshToken;
            await getRefreshToken(refresh_token, req);
            console.log("if before getRefreshToken success async problem, if after success");
            access_token = req.session.accessToken;
            token_type = req.session.tokenType;
            refresh_token = req.session.refreshToken;

            axios.get('https://api.zoom.us/v2/users/me', {
                    headers: {
                        Authorization: `${token_type} ${access_token}`
                    }
                })
                .then(response => {
                    console.log("in getUser refresh success");
                    res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
                }).catch(error => {
                    res.send(error);
                })    
        }
        else{
            res.send(error);
        } 
    });
}
export default getUser;
        