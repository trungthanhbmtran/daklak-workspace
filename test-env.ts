const { getAuthPolicy } = require('./shared/core/auth-session.ts');
console.log('Secure cookie:', getAuthPolicy().secureCookie);
