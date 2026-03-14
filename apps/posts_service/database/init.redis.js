// 'use strict'

// const {createClient} = require('redis')

// const config = {
//     host: 'localhost', // Replace with your Redis host
//     port: 6379,        // Replace with your Redis port
//     //password: 'yourpassword', // Uncomment and set your Redis password, if needed
//     //username: 'yourusername'  // Uncomment and set your Redis username, if authentication is required
// };

// let client = {}
// let statusConnectRedis = {
//     CONNECT : 'connect ',
//     END : 'end',
//     RECONNECT : "reconnecting",
//     ERROR : "error"
// }
// let connectionTimeout

// const REDIS_CONNECT_TIMEOUT = 10000
// const REDIS_CONNECT_MESSAGE ={
//     code : -99,
//     message : {
//         vn  : "Redis loi roi ",
//         en : "Services connection error"
//     }
// }

// const handleTimeoutError = () =>{
//     connectionTimeout = setTimeout(() => {
//         console.error(REDIS_CONNECT_MESSAGE);
//         // Here you can handle the timeout error, such as logging or throwing an error
//         // throw new Error(REDIS_CONNECT_MESSAGE.message.en);
//     }, REDIS_CONNECT_TIMEOUT);
// }


// const handleEventConnection = ({
//     connectionRedis
// }) =>{
//     connectionRedis.on(statusConnectRedis.CONNECT, () =>{
//         console.log(`connectionRedis - Connection status : connected `)
//         // clearTimeout(connectionTimeout)
//     })

//     connectionRedis.on(statusConnectRedis.END, () =>{
//         console.log(`connectionRedis - Connection status : disconnected `)
//         // //connect retry
//         // handleTimeoutError()
//     })

//     connectionRedis.on(statusConnectRedis.RECONNECT, () =>{
//         console.log(`connectionRedis - Connection status : reconnecting `)
//         // clearTimeout(connectionTimeout)
//     })

//     connectionRedis.on(statusConnectRedis.ERROR, (err) =>{
//         console.log(`connectionRedis - Connection status : error ${err} `)
//         // handleTimeoutError()
//     })
// }

// const initRedis = () => {
//         const instanceRedis = createClient(config)
//         client.instanceConnect = instanceRedis
//         console.log('instanceConnect',instanceConnect)
//         handleEventConnection({connectionRedis : instanceRedis})
// }

// const getRedis = () => client

// const closeRedis = () => {
//     if (client.instanceConnect) {
//         client.instanceConnect.quit();
//     }
// };

// module.exports ={
//     initRedis,
//     getRedis,
//     closeRedis
// }




const { createClient } = require('redis');

const host = 'app-redis'
const port = 6379

let redisClient;

let statusConnectRedis = {
    CONNECT : 'connect ',
    END : 'end',
    RECONNECT : "reconnecting",
    ERROR : "error"
}

const handleEventConnection = ({
    connectionRedis
}) =>{
    connectionRedis.on(statusConnectRedis.CONNECT, () =>{
        console.log(`connectionRedis - Connection status : connected `)
        // clearTimeout(connectionTimeout)
    })

    connectionRedis.on(statusConnectRedis.END, () =>{
        console.log(`connectionRedis - Connection status : disconnected `)
        // //connect retry
        // handleTimeoutError()
    })

    connectionRedis.on(statusConnectRedis.RECONNECT, () =>{
        console.log(`connectionRedis - Connection status : reconnecting `)
        // clearTimeout(connectionTimeout)
    })

    connectionRedis.on(statusConnectRedis.ERROR, (err) =>{
        console.log(`connectionRedis - Connection status : error ${err} `)
        // handleTimeoutError()
    })
}

(async () => {
    // redisClient = createClient({ url : process.env.REDIS_URI});
    // redisClient = createClient({ url : 'redis://localhost:6379'});
    redisClient = createClient({ url : 'redis://app-redis:6379'});
    handleEventConnection({connectionRedis : redisClient})
    await redisClient.connect();
})();

module.exports = redisClient



