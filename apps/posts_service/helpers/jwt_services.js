const jwt = require('jsonwebtoken')
const createError = require('http-errors');
const redisClient = require('../database/init.redis')


const signAccessToken = async (id, identitycard, roles) => {
    return new Promise((resolve, reject) => {
        const payload = {
            id,
            identitycard,
            roles
        }
        const secret = process.env.ACCESS_TOKEN_SECRET;
        console.log('secret', secret)
        const options = {
            expiresIn: '1w'
        }

        jwt.sign(payload, secret, options, (err, token) => {
            if (err) reject(err)
            resolve(token)
        })
    })
}

const verifyAccessToken = (token) => {
    return new Promise((resolve, reject) => {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        jwt.verify(token, secret, (err, payload) => {
            if (err) reject(err)
            resolve(payload)
        })
    })
    // console.log('req',req.headers)
    // const authHeader = req.headers['authorization'];
    // // console.log("authHeader",authHeader)
    // if(!authHeader){
    //     return next(createError.Unauthorized())
    // }
    // const bearerToken = authHeader.split(' ');
    // const token = bearerToken[1];
    // console.log('token',bearerToken)
    //start verify token

    // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    //     if (err) {
    //         // if(err.name === 'JsonWebTokenError'){
    //         //     return next(createError.Unauthorized())
    //         // }
    //         console.log("err", err)
    //         return err
    //     }
    //     console.log('payload', payload)
    //     return payload
    //     // req.payload = payload
    // })

}

const signRefreshToken = async (id, identitycard, roles) => {
    try {
        const payload = {
            id,
            identitycard,
            roles
        }
        const secret = process.env.REFRESH_TOKEN_SECRET;
        const options = {
            expiresIn: '1y'
        };

        const refreshToken = await jwt.sign(payload, secret, options);
        await redisClient.set(id.toString(), refreshToken, 'EX', 365 * 24 * 60 * 60);
        // const value = await redisClient.get(id_nv.toString());
        // console.log('result',value)
        return refreshToken;
    } catch (error) {
        console.log('error', error)
        throw createError.InternalServerError(error.message);
    }
}

const verifyRefreshToken = (refreshToken) => {
    // console.log('refreshToken',refreshToken)
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
            if (err) {
                // console.log('err jwt',err)
                return reject(err)
            }
            console.log('payload', payload)
            redisClient.get(payload.employeeId, (err, replay) => {
                if (err) {
                    // console.log('err',err)
                    return reject(createError.InternalServerError())
                }
                //    console.log('replay',replay)
                if (refreshToken === replay) {
                    // console.log('true')
                    return resolve(payload)
                }
                //    console.log('replay',replay)
                return reject(createError.Unauthorized())
            })
        })
    })
}


module.exports = {
    signAccessToken,
    verifyAccessToken,
    signRefreshToken,
    verifyRefreshToken,
}