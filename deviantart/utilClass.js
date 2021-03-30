import * as fs from 'fs';

export class Util {

    // 指定した時間(ms)だけ処理を停止する
    async sleep(time) {
        // ref: https://qiita.com/albno273/items/c2d48fdcbf3a9a3434db
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    // ファイル出力（writeFile使用）
    async fileOutput (data, dirname, filename) {
        try {
            const fixedData = JSON.stringify(data, null, "  ");
            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname);
            }
            await fs.writeFile(
                `${dirname}/${filename}`,
                fixedData,
                (e) => {
                    if (e) console.log("error: ", e);
                }
            );
        } catch (e) {
            console.log("error: ", e.message);
            return false;
        }
        console.log(`File Output Completed: ${dirname}/${filename}`);
    }

    // ファイル出力（createWriteStream使用）
    async fileOutputStream(dataArray, dirname, filename) {
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname);
        }
        const stream = fs.createWriteStream(`${dirname}/${filename}`);
        for (const datum of dataArray) {
            stream.write(datum);
        }
        stream.end('\n');
        stream.on('finish', () => {
            console.log(`File Stream Output Completed: ${dirname}/${filename}`);
        });
        stream.on('error', (e) => {
            if (e) console.log("error: ", e);
        });
    }
}