import { DEVIANTART } from '../env.js';
import { Deviantart } from './deviantartClass.js';
import { Util } from './utilClass.js';

const da = new Deviantart();
const util = new Util();

const client_id = DEVIANTART.CLIENT_ID;
const client_secret = DEVIANTART.CLIENT_SECRET;
const username = DEVIANTART.USERNAME;

// 指定したfavouritesフォルダに格納されているdeviationを全て取得
const contentsPicker = async (token, [folder_uuid, folder_name]) => {
    let loopIndex = 1;
    let nextOffset = true;
    let collectionContents;
    const contentsPickCycle = async () => {
        collectionContents = await da.getCollectionContents(token, folder_uuid, nextOffset);
        await util.fileOutputJson(collectionContents, `./json/${folder_name}`, `contents_test_${folder_name}_no${loopIndex}.json`);
        await util.sleep(5000);
        if (collectionContents.has_more) {
            nextOffset = collectionContents.next_offset;
            loopIndex++;
            await contentsPickCycle();
        }
    };
    await contentsPickCycle();
};

(async () => {

    // OAuth2 Client Credentials認証でBearer Tokenを取得
    const token = await da.oauth2ClientCredentials(client_id, client_secret);
    // 指定したユーザーのfavouritesフォルダの一覧を取得
    const favorites = await da.getCollectionFolders(token, username);
    await util.fileOutputJson(favorites, './json', 'folders_test.json');
    
    // 取得した各favouritesフォルダのUUIDとフォルダ名を配列に追加
    let folders = [];
    for (const data of favorites.results) folders.push([data.folderid, data.name]);

    // 全てのfavouritesフォルダに格納されているdeviationを全て取得
    for (const index in folders) await contentsPicker(token, folders[index]);

    // 指定したUUIDのdeviationをオリジナル画質でダウンロード（可能なものに限る）
    // const deviationOriginalImage = await da.getOriginalDeviationImage(token, 'D4A3AA6A-6E92-12C5-D3C4-C63291C25682');

    // 指定したUUIDのdeviation objectを取得
    // const deviationObj = await da.getDeviationObj(token, 'D4A3AA6A-6E92-12C5-D3C4-C63291C25682');

})();
