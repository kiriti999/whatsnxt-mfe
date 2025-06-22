import xior from 'xior';
import cookie from 'js-cookie';


export const checkSuccessResponse = res => {
  return res?.status === 200 || res?.status === 201 || res?.success === true
}

export function checkGraphqlResponse(response: any) {
  // Check if there are errors in the response data
  if (response.errors && response.errors.length > 0) {
    throw new Error(response.errors[0].message || 'An error occurred.');
  }

  // Ensure the response contains the expected data
  if (!response.data) {
    throw new Error('Invalid response format.');
  }

  return response.data;
}

export function isWebWorker(): boolean {
  // @ts-ignore
  return typeof Worker !== 'undefined' && typeof importScripts === 'function';
}

export const handleLogin = (token: any) => {
  setLoginCookie(process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN, token);
};

const setLoginCookie = (key, value: any) => {
  cookie.set(key, value, { sameSite: 'strict' });
};
export const removeCookie = (key) => {
  cookie.remove(key);
};

export const getCookieAccessToken = () => {
  return cookie.get(process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN)
};

export const getCookieUserInfo = () => {
  return cookie.get(process.env.NEXT_PUBLIC_COOKIES_USER_INFO)
}

export const fetchUser = async (token: any) => {
  try {
    const payload = { headers: { Authorization: token } };
    const url = `${process.env.NEXT_PUBLIC_BFF_HOST_COMMON_API}/profile`;
    // const response = await AccountAPI.get(); // This is not working - dont use AccountAPI
    const response = await xior.get(url, payload);
    return response?.data;
  } catch (error) {
    console.log('auth.js:: fetchUser:: error: ', error);
  }
};

export const getErrorMessageFromResponse = error => {
  if (error?.response && error?.response?.data) {

    if (error?.response?.data?.message) return error.response.data.message

    return error.response.data

  }
  return ''
}