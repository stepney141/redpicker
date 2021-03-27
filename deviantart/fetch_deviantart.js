import fetch from 'node-fetch';
import { DEVIANTART } from '../env.js';

const client_id = DEVIANTART.CLIENT_ID;
const client_secret = DEVIANTART.CLIENT_SECRET;

const oauth2ClientCredentials = async (client_id, client_secret) => {
    try {
        const params = {
            grant_type: 'client_credentials',
            client_id: client_id,
            client_secret: client_secret,
        };
        const query = new URLSearchParams(params);
        const call = await fetch('https://www.deviantart.com/oauth2/token',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: query
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

const getCollectionFolders = async (token) => {
    try {
        const params = {
            username: DEVIANTART.USERNAME,
            calculate_size: true,
            offset: 0,
            limit: 10,
            access_token: token
        };
        const query = new URLSearchParams(params);
        const call = await fetch(`https://www.deviantart.com/api/v1/oauth2/collections/folders?${query}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                }
            }
        );
        if (call.ok) {
            return (await call.json());
        } else {
            throw new Error(`${call.status} ${call.statusText}`);
        }
    } catch (e) {
        console.log(e);
    }
};

const getCollectionContents = async (token, folderid) => {
    try {
        const params = {
            username: DEVIANTART.USERNAME,
            offset: 0,
            limit: 10,
            mature_content: true,
            access_token: token
        };
        const query = new URLSearchParams(params);
        const call = await fetch(`https://www.deviantart.com/api/v1/oauth2/collections/${folderid}?${query}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                }
            }
        );
        if (call.ok) {
            return (await call.json());
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
    const token = await oauth2ClientCredentials(client_id, client_secret);
    const favorites = await getCollectionFolders(token);
    for (const data of favorites.results) {
        console.log(data.folderid);
    }
    // await oauth2revoke();
})();
