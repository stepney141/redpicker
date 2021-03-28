import fetch from 'node-fetch';
import { DEVIANTART } from '../env.js';

const client_id = DEVIANTART.CLIENT_ID;
const client_secret = DEVIANTART.CLIENT_SECRET;
const username = DEVIANTART.USERNAME;

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
        if (!call.ok)  {
            throw new Error(`${call.status} ${call.statusText} ${await call.text()}`);
        }
        return (await call.json()).access_token;
    } catch (e) {
        console.log(e);
        return false;
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
        if (!call.ok) {
            throw new Error(`${call.status} ${call.statusText} ${await call.text()}`);
        }
        return (await call.json());
    } catch (e) {
        console.log(e);
        return false;
    }
};

const getCollectionFolders = async (token, username) => {
    try {
        const params = {
            username: username,
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
        if (!call.ok) {
            throw new Error(`${call.status} ${call.statusText} ${await call.text()}`);
        }
        return (await call.json());
    } catch (e) {
        console.log(e);
        return false;
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
        if (!call.ok) {
            throw new Error(`${call.status} ${call.statusText} ${await call.text()}`);
        }
        return (await call.json());
    } catch (e) {
        console.log(e);
        return false;
    }
};

const getOriginalDeviationImage = async (token, deviationid) => {
    try {
        const params = {
            mature_content: true,
            access_token: token
        };
        const query = new URLSearchParams(params).toString();
        const call = await fetch(`https://www.deviantart.com/api/v1/oauth2/deviation/download/${deviationid}?${query}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                }
            }
        );
        if (!call.ok) {
            throw new Error(`${call.status} ${call.statusText} ${await call.text()}`);
        }
        return (await call.json());
    } catch (e) {
        console.log(e);
        return false;
    }
};

const getDeviation = async (token, deviationid) => {
    try {
        const params = {
            expand: true,
            access_token: token
        };
        const query = new URLSearchParams(params).toString();
        const call = await fetch(`https://www.deviantart.com/api/v1/oauth2/deviation/${deviationid}?${query}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                }
            }
        );
        if (!call.ok) {
            throw new Error(`${call.status} ${call.statusText} ${await call.text()}`);
        }
        return (await call.json());
    } catch (e) {
        console.log(e);
        return false;
    }
};

(async () => {
    // OAuth2 Client Credentials認証でBearer Tokenを取得
    const token = await oauth2ClientCredentials(client_id, client_secret);
    // 指定したユーザーのfavouritesフォルダの一覧を取得
    const favorites = await getCollectionFolders(token, username);

    // 取得した各favouritesフォルダのUUIDを配列に追加
    let folders = [];
    for (const data of favorites.results) {
        folders.push(data.folderid);
    }

    // 指定したfavouritesフォルダに格納されているdeviationを取得
    const contents = await getCollectionContents(token, folders[0]);

    // 指定したUUIDのdeviationをオリジナル画質でダウンロード（可能なものに限る）
    const deviationOriginalImage = await getOriginalDeviationImage(token, 'D4A3AA6A-6E92-12C5-D3C4-C63291C25682');

    // 指定したUUIDのdeviation objectを取得
    const deviationJson = await getDeviation(token, 'D4A3AA6A-6E92-12C5-D3C4-C63291C25682');
    console.log(deviationJson);

})();
