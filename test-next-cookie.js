const { cookies } = require('next/headers');
const { RequestCookies } = require('next/dist/compiled/@edge-runtime/cookies');

const headers = new Headers();
headers.set('cookie', 'accessToken=; accessToken=; accessToken=; refreshToken=; refreshToken=; refreshToken=; session=; session=; session=; accessToken=REAL; refreshToken=REAL_REFRESH');

const reqCookies = new RequestCookies(headers);
console.log('accessToken:', reqCookies.get('accessToken'));
