import fetch from 'node-fetch';
import { DEVIANTART } from '../env.js';

export class Deviantart {

    // OAuth2 Client Credential認証でBearer Tokenを取得
    async oauth2ClientCredentials (client_id, client_secret) {
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
            if (!call.ok) {
                throw new Error(`${call.status} ${call.statusText} ${await call.text()}`);
            }
            return (await call.json()).access_token;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    //指定したBearer Tokenを無効にする
    async oauth2revoke (token) {
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
    }

    // 指定したユーザーのfavoritesフォルダの一覧を取得
    async getCollectionFolders (token, username) {
        try {
            const params = {
                username: username,
                calculate_size: true,
                offset: 0,
                limit: 24,
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
    }

    // 指定したfavoritesフォルダ内のdeviationを取得
    async getCollectionContents (token, folderid, offset = 0) {
        try {
            const params = {
                username: DEVIANTART.USERNAME,
                offset: offset,
                limit: 24,
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
    }

    // 指定したdeviationをオリジナル画質でダウンロード（可能なものに限る）
    async getOriginalDeviationImage (token, deviationid) {
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
    }

    // 指定したdeviation objectを取得
    async getDeviationObj (token, deviationid) {
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
    }

}