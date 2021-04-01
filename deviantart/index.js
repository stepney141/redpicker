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

// 指定したUUIDのdeviationをオリジナル画質でダウンロード（可能なものに限る）
const originalImagePicker = async () => {};

(async () => {

    // OAuth2 Client Credentials認証でBearer Tokenを取得
    const token = await da.oauth2ClientCredentials(client_id, client_secret);

    // 指定したユーザーのfavouritesフォルダの一覧を取得
    const favourites_folders = await da.getCollectionFolders(token, username);
    await util.fileOutputJson(favourites_folders, './json', 'folders_test.json');
    
    // 各favouritesフォルダのUUIDとフォルダ名の情報を取り出し、配列にする
    const folder_info = favourites_folders.results.map(element =>  [element.folderid, element.name]);

    // 全てのfavouritesフォルダに格納されているdeviationを全て取得
    for (const array of folder_info) await contentsPicker(token, array);

    // 指定したUUIDのdeviationをオリジナル画質でダウンロード（可能なものに限る）
    const deviationOriginalImage = await da.getOriginalDeviationImage(token, '72517C15-5031-2EFC-2BE5-D45F96B03990');
    await util.fileOutputBinary(deviationOriginalImage, './img', '72517C15-5031-2EFC-2BE5-D45F96B03990.png');

    // 指定したUUIDのdeviation objectを取得
    // const deviationObj = await da.getDeviationObj(token, '72517C15-5031-2EFC-2BE5-D45F96B03990');

    // 指定したUUIDのdeviation（小説）の文章を取得
    // const text = await da.getDeviationText(token, 'F5CCB77D-EFA5-F7BB-6803-21A4D2CBEC34')

})();
