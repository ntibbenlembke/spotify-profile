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
    window.localStorage.removeItem('spotify_token_timestamp');
    window.localStorage.removeItem('spotify_access_token');
    window.localStorage.removeItem('spotify_refresh_token');
    window.location.reload();
    
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
    if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken !== 'undefined') {
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

//jaxious global request headers
axios.defaults.baseURL = 'https://api.spotify.com/v1';
axios.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
axios.defaults.headers['Content-Type'] = 'application/json';

/* get current user's profile 
https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-current-users-profile
returns Promise */
export const getCurrentUserProfile = () => axios.get('/me');

/**
 * Get a List of Current User's Playlists
 * https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-a-list-of-current-users-playlists
 * @returns {Promise}
 */
export const getCurrentUserPlaylists = (limit = 20) => {
    return axios.get(`/me/playlists?limit=${limit}`);
};

/**
 * Get a User's Top Artists and Tracks
 * https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-users-top-artists-and-tracks
 * @param {string} time_range - 'short_term' (last 4 weeks) 'medium_term' (last 6 months) or 'long_term' (calculated from several years of data and including all new data as it becomes available). Defaults to 'short_term'
 * @returns {Promise}
 */
export const getTopArtists = (time_range = 'short_term') => {
    return axios.get(`/me/top/artists?time_range=${time_range}`);
};

/**
 * Get a User's Top Tracks
 * https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-users-top-artists-and-tracks
 * @param {string} time_range - 'short_term' (last 4 weeks) 'medium_term' (last 6 months) or 'long_term' (calculated from several years of data and including all new data as it becomes available). Defaults to 'short_term'
 * @returns {Promise}
 */
export const getTopTracks = (time_range = 'short_term') => {
    return axios.get(`/me/top/tracks?time_range=${time_range}`);
};

/**
 * Get a Playlist
*/
export const getPlaylistById = playlist_id => {
    return axios.get(`/playlists/${playlist_id}`);
};

/* Get audio features for several trakcs */
export const getAudioFeaturesForTracks = ids => {
    return axios.get(`/audio-features?ids=${ids}`);
};

