import { DEVIANTART } from '../env.js';
import { Deviantart } from './deviantartClass.js';
import { Util } from './utilClass.js';

const da = new Deviantart();
const util = new Util();

const client_id = DEVIANTART.CLIENT_ID;
const client_secret = DEVIANTART.CLIENT_SECRET;
const username = DEVIANTART.USERNAME;

(async () => {

    // OAuth2 Client Credentials認証でBearer Tokenを取得
    const token = await da.oauth2ClientCredentials(client_id, client_secret);
    // 指定したユーザーのfavouritesフォルダの一覧を取得
    const favorites = await da.getCollectionFolders(token, username);
    await util.fileOutput(favorites, './json', 'folders_test.json');
    
    // 取得した各favouritesフォルダのUUIDを配列に追加
    let folders = [];
    for (const data of favorites.results) {
        folders.push(data.folderid);
    }

    // 指定したfavouritesフォルダに格納されているdeviationを取得
    const collectionContents = await da.getCollectionContents(token, folders[0]);
    await util.fileOutput(collectionContents, './json', 'contents_test_01.json');
    if (collectionContents.has_more) {
        const collectionContents02 = await da.getCollectionContents(token, folders[0], collectionContents.next_offset);
        await util.fileOutput(collectionContents02, './json', 'contents_test_02.json');
    }

    // 指定したUUIDのdeviationをオリジナル画質でダウンロード（可能なものに限る）
    // const deviationOriginalImage = await da.getOriginalDeviationImage(token, 'D4A3AA6A-6E92-12C5-D3C4-C63291C25682');

    // 指定したUUIDのdeviation objectを取得
    // const deviationObj = await da.getDeviationObj(token, 'D4A3AA6A-6E92-12C5-D3C4-C63291C25682');

})();
