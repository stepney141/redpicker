const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const fs = require('fs');
const { generators } = require('openid-client');

const { userid, password}= JSON.parse(fs.readFileSync('./env.json'));

// Latest app version can be found using GET /v1/application-info/android
const USER_AGENT = "PixivAndroidApp/5.0.234 (Android 11; Pixel 5)";
const REDIRECT_URI = "https://app-api.pixiv.net/web/v1/users/auth/pixiv/callback";
const LOGIN_URL = "https://app-api.pixiv.net/web/v1/login";
const AUTH_TOKEN_URL = "https://oauth.secure.pixiv.net/auth/token";
const CLIENT_ID = "MOBrBDS8blbauoSck0ZfDbtuzpyT";
const CLIENT_SECRET = "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj";

// xpath strings for the automatic login
const userid_input_xpath = '//*[@id="LoginComponent"]/form/div[1]/div[1]/input';
const password_input_xpath = '//*[@id="LoginComponent"]/form/div[1]/div[2]/input';
const login_button_xpath = '//*[@id="LoginComponent"]/form/button';

const sleep = async (seconds) => new Promise((resolve, reject) => { setTimeout(() => { resolve(); }, seconds * 1000); });

const oauth_pkce = () => {
    /* Proof Key for Code Exchange by OAuth Public Clients (RFC7636). */
    const code_verifier = generators.codeVerifier(32);
    const code_challenge = generators.codeChallenge(code_verifier);
    return { code_verifier, code_challenge };
};

const print_auth_token_response = (response) => {
    const data = response.json();

    const access_token = data.access_token;
    const refresh_token = data.refresh_token;

    console.log("access_token:", access_token);
    console.log("refresh_token:", refresh_token);
    console.log("expires_in:", ("expires_in" in data) ? data.expires_in : 0);
};

const login = async () => {
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1000, height: 1000 },
        // headless: true,
        devtools: true,
    });

    try {
        const { code_verifier, code_challenge } = oauth_pkce();
        const login_params = {
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
            "client": "pixiv-android",
        };
        const login_query = new URLSearchParams(login_params).toString();

        const page = await browser.newPage();
        await page.goto(`${LOGIN_URL}?${login_query}`);

        await page.tracing.start();

        const userid_input_elementHandle = page.$x(userid_input_xpath);
        const password_input_elementHandle = page.$x(password_input_xpath);
        const login_button_elementHandle = page.$x(login_button_xpath);
        await (await userid_input_elementHandle)[0].type(userid);
        await (await password_input_elementHandle)[0].type(password);
        await (await login_button_elementHandle)[0].click();

        await page.waitForNavigation({timeout: 60000});

        // filter code url from performance logs
        let code;
        page.on('request', request => {
            if (request.url().includes("pixiv://")) {
                console.log("success");
                code = request.url().match(/code=([^&]*)/)[1];
            }
        });

        await page.tracing.stop();

        console.log(`[INFO] Get code: ${code}`);

        await browser.close();

        const response = await fetch(AUTH_TOKEN_URL,
            {
                method: "POST",
                body: {
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "code": code,
                    "code_verifier": code_verifier,
                    "grant_type": "authorization_code",
                    "include_policy": "true",
                    "redirect_uri": REDIRECT_URI,
                },
                headers: {
                    "User-Agent": USER_AGENT,
                },
            }
        );
        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText} ${await response.text()}`);
        }
        print_auth_token_response(response);

    } catch (error) {
        console.log(error);
    }
    // finally {
    //     await browser.close();
    // }
};

const refresh = async (refresh_token) => {
    const response = await fetch(AUTH_TOKEN_URL,
        {
            method: "POST",
            body: {
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "grant_type": "refresh_token",
           
                "include_policy": "true",
                "refresh_token": refresh_token,
            },
            headers: {
                "User-Agent": USER_AGENT
            }
        }
    );
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} ${await response.text()}`);
    }
    print_auth_token_response(response);
};

(async () => {
    if (!process.argv[2]) {
        throw new Error("input 'login' or 'refresh' after 'node index.js'");
    }
    if (process.argv[2] == "login") {
        await login();
    }
    if (process.argv[2] == "refresh") {
        if (!process.argv[3]) {
            throw new Error("input a token you want to refresh");
        } else {
            const old_refresh_token = process.argv[3];
            await refresh(old_refresh_token);
        }
    }
})();