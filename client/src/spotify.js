import axios from "axios";

const LOCALSTORAGE_KEYS = {
    accessToken: 'spotify_access_token',
    refreshToken: 'spotify_refresh_token',
    expireTime: 'spotify_token_expire_time',
    timestamp: 'spotify_token_timestamp'
};

//map to retrieving local storage values
const LOCALSTORAGE_VALUES ={
    accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
    refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
    expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
    timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
};

/* clears out localstorage items and reloads the page */
export const logout = () => {
    //clear all localstorage items
    for (const property in LOCALSTORAGE_KEYS) {
        window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
    }
    //navigate to homepage
    window.location = window.location.origin;
};

/* checks if the previous accesstoken has been around for longer than the 
expiration time. returns a boolean whether or not it has expired */
const hasTokenExpired = () => {
    const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALUES;
    if (!accessToken || !timestamp) {
        return false;
    }
    const millisecondsElapsed = Date.now() - Number(timestamp);
    return (millisecondsElapsed / 1000) > Number(expireTime);
};

/* use the refresh token in localstorage to hit the /refresh_token endpoint
in the node app, then update values in localStorage. doesn't return anything. */
const refreshToken = async () => {
    try{
        //logout if there's no refresh token
        if (!LOCALSTORAGE_VALUES.refreshToken || LOCALSTORAGE_VALUES.refreshToken === 'undefined' || (Date.now() - Number(LOCALSTORAGE_VALUES.timestamp)/1000) < 1000) {
            console.error('No refresh token available');
            logout();
        }

        //use `refresh_token` endpoint from the Node app
        const { data } = await axios.get(`/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`);

        //update localstorage values
        window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, data.access_token);
        window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());

        //reload page for localstorage updates to be reflected
        window.location.reload();
    } catch (e) {
        console.error(e);
    }
};

/* retrieves spotify access token from localStorage or URL query params */
const getAccessToken = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const queryParams = {
        [LOCALSTORAGE_KEYS.accessToken]: urlParams.get('access_token'),
        [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
        [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
    };
    const hasError = urlParams.get('error');

    //refresh the token if there's an error OR the localstorage token expires
    if (hasError || hasTokenExpired() || LOCALSTORAGE_VALUES.accessToken === 'undefined') {
        refreshToken();
    }

    //if there's a valid localstorage token, use that 
    if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken != 'undefined') {
        return LOCALSTORAGE_VALUES.accessToken;
    }

    //if there's a token in URL query params, user is logging in for the first time
    if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
        //store the query params in local storage
        for (const property in queryParams) {
            window.localStorage.setItem(property, queryParams[property]);
        }
        //set timestamp
        window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
        //return access token from query params
        return queryParams[LOCALSTORAGE_KEYS.accessToken];
    }

    //hopefully never get here
    return false;
};

export const accessToken = getAccessToken();