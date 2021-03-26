import fetch from 'node-fetch';
import DEVIANTART from '../env.js';

const client_id = DEVIANTART.CLIENT_ID;
const client_secret = DEVIANTART.CLIENT_SECRET;

const oauth2ClientCredentials = async (client_id, client_secret) => {
    try {
        const call = await fetch('https://www.deviantart.com/oauth2/token',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`
            }
        );
        if (call.ok) {
            return (await call.json()).access_token;
        } else {
            throw new Error(`${call.status} ${call.statusText}`);
        }
    } catch (e) {
        console.log(e);
    }
};

const oauth2revoke = async (token) => {
    try {
        const call = await fetch('https://www.deviantart.com/oauth2/revoke',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: `token=${token}`
            }
        );
        if (call.ok) {
            console.log(await call.json());
        } else {
            throw new Error(`${call.status} ${call.statusText}`);
        }
    } catch (e) {
        console.log(e);
    }
};

(async () => {
    await oauth2ClientCredentials(client_id, client_secret);
    // await oauth2revoke();
})();
