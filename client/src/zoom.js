import axios from 'axios';



// Map for localStorage keys
const LOCALSTORAGE_KEYS = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    expireTime: 'expire_time',
    timestamp: 'timestamp',
  }
  
  // Map to retrieve localStorage values
  const LOCALSTORAGE_VALUES = {
    accessToken: sessionStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
    refreshToken: sessionStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
    expireTime: sessionStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
    timestamp: sessionStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
  };

const getAccessToken = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const queryParams = {
        [LOCALSTORAGE_KEYS.accessToken]: urlParams.get('access_token'),
        [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
        [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
      };

    const hasError = urlParams.get('error');

    // If there's an error OR the token in localStorage has expired, refresh the token
    if (hasError || hasTokenExpired() || LOCALSTORAGE_VALUES.accessToken === 'undefined') {
      console.log("start refresh token function");  
      refreshToken();
    }

    // If there is a valid access token in localStorage, use that
    if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken !== 'undefined') {
        return LOCALSTORAGE_VALUES.accessToken;
    }

    // If there is a token in the URL query params, user is logging in for the first time
    if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
        // Store the query params in localStorage
        for (const property in queryParams) {
        sessionStorage.setItem(property, queryParams[property]);
        }
        // Set timestamp
        sessionStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());

        window.location = window.location.origin;

        // Return access token from query params
        return queryParams[LOCALSTORAGE_KEYS.accessToken];
    }

    // We should never get here!
    return false;
  };

  const hasTokenExpired = () => {
    const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALUES;
    if (!accessToken || !timestamp) {
      return false;
    }
    const millisecondsElapsed = Date.now() - Number(timestamp);
    return (millisecondsElapsed / 1000) > Number(expireTime);
  };

  const refreshToken = async () => {
    try {
      // Logout if there's no refresh token stored or we've managed to get into a reload infinite loop
      if (!LOCALSTORAGE_VALUES.refreshToken ||
        LOCALSTORAGE_VALUES.refreshToken === 'undefined' ||
        (Date.now() - Number(LOCALSTORAGE_VALUES.timestamp) / 1000) < 1000
      ) {
        console.error('No refresh token available');
        logout();
      }
      else{
        debugger;
        // Use `/refresh_token` endpoint from our Node app
        const { data } = await axios.get(`/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`);
        


        console.log(data);

        
          // Update localStorage values
          sessionStorage.setItem(LOCALSTORAGE_KEYS.accessToken, data.access_token);
          sessionStorage.setItem(LOCALSTORAGE_KEYS.refreshToken, data.refresh_token);
          sessionStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
        if(LOCALSTORAGE_VALUES.accessToken === "undefined" && LOCALSTORAGE_VALUES.refreshToken === "undefined"){
          logout();//
        }
        else{
      
          // Reload the page for localStorage updates to be reflected
          window.location.reload();
        }
    }
  
    } catch (e) {
      console.error(e);
    }
  };

  export const logout = () => {
    // Clear all localStorage items
    for (const property in LOCALSTORAGE_KEYS) {
      sessionStorage.removeItem(LOCALSTORAGE_KEYS[property]);
    }
    // Navigate to homepage
    window.location = window.location.origin;
  };
  
  export const getCurrentUserProfile = () => axios.get('/user');
  export const getMeetingList = () => axios.get('/getMeetingList?type=previous_meetings');
  export const accessToken = getAccessToken();