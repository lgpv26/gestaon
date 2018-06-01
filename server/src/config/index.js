const packageJSON = require('../../package.json')
const utils = require('../utils/index')
const path = require('path')

if(process.env.NODE_ENV === 'production') {
    module.exports = {
        mainServer: {
            port: 8080,
            debug: {
                protocols: false
            },
            version: packageJSON.version
        },
        requestBoard: {
            defaultPosition: 65535
        },
        oAuth2: {
            webClient: {
                rawId: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpZCIsImNsaWVudCI6IndlYiIsIm5hbWUiOiJncHMuYWdpbGl6YS5tZSJ9.Wr3wqVZwwMyYN3MO9bDgyvhpOow0nFcEmCdPhutTwc0",
                rawSecret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzZWNyZXQiLCJjbGllbnQiOiJ3ZWIiLCJuYW1lIjoiZ3BzLmFnaWxpemEubWUifQ.oy_gMYX_8-BaoexwYW4yDpdnrZTSLOxYAHUPgITyQc4",
                encryptedId: "9847036e0b64e474cbf4a97fcc0acb0d3d154af3", // SHA1
                encryptedSecret: "caf4ca9009782bc96be604a97f0ca036ea986c15" // SHA1
            },
            rnClient: {
                rawId: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpZCIsImNsaWVudCI6InJuIiwibmFtZSI6Imdwcy5hZ2lsaXphLm1lIn0.YtPxdaSSYQ69upFG0La5iviSlHUZ5tm4jEaPvr8lPSs",
                rawSecret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzZWNyZXQiLCJjbGllbnQiOiJybiIsIm5hbWUiOiJncHMuYWdpbGl6YS5tZSJ9.zTERSHsluY7JXPMjjA6MEcKJARqScAghtTT4aj2tofw",
                encryptedId: "bea71d66f99982a2f792bd10c514bc8716b7dbe9",
                encryptedSecret: "6db833ba298b830d131566d6ceede5280504b461"
            }
        },
        database: {
            dialect: 'mysql',
            host: 'localhost',
            dbName: 'gestaon-dev',
            user: 'root',
            password: 'atrroot'
        },
        mongoDb: {
            host: 'localhost',
            dbName: 'GestaON'
        },
        pubNub: {
            subscribeKey: "sub-c-ddbbcb76-eec5-11e6-889b-02ee2ddab7fe",
            publishKey: "pub-c-5d6cc830-62a4-484e-885b-9a8180819e46",
            uuid: "server-" + utils.createId()
        },
        elasticSearch: {
            host: 'localhost',
            port: 9200,
            requestTimeout: 5000
        },
        protocols: [
            {name: 'gps103', port: 6001, debug: false},
            /*{name: 'tk103', port: 6002},
            {name: 'gt06', port: 6023},*/
            {name: 'tlt2h', port: 6030, debug: false},
            {name: 'agiliza', port: 6150, debug: false},
            {name: 'osmand', port: 6055, debug: false}
        ],
        redis: {
            active: false
        }
    };
}
else{
    
    module.exports = {
        mainServer: {
            port: 8080,
            debug: {
                protocols: false
            },
            version: packageJSON.version
        },
        requestBoard: {
            defaultPosition: 65535
        },
        oAuth2: {
            webClient: {
                rawId: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpZCIsImNsaWVudCI6IndlYiIsIm5hbWUiOiJncHMuYWdpbGl6YS5tZSJ9.Wr3wqVZwwMyYN3MO9bDgyvhpOow0nFcEmCdPhutTwc0",
                rawSecret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzZWNyZXQiLCJjbGllbnQiOiJ3ZWIiLCJuYW1lIjoiZ3BzLmFnaWxpemEubWUifQ.oy_gMYX_8-BaoexwYW4yDpdnrZTSLOxYAHUPgITyQc4",
                encryptedId: "9847036e0b64e474cbf4a97fcc0acb0d3d154af3", // SHA1
                encryptedSecret: "caf4ca9009782bc96be604a97f0ca036ea986c15" // SHA1
            },
            rnClient: {
                rawId: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpZCIsImNsaWVudCI6InJuIiwibmFtZSI6Imdwcy5hZ2lsaXphLm1lIn0.YtPxdaSSYQ69upFG0La5iviSlHUZ5tm4jEaPvr8lPSs",
                rawSecret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzZWNyZXQiLCJjbGllbnQiOiJybiIsIm5hbWUiOiJncHMuYWdpbGl6YS5tZSJ9.zTERSHsluY7JXPMjjA6MEcKJARqScAghtTT4aj2tofw",
                encryptedId: "bea71d66f99982a2f792bd10c514bc8716b7dbe9",
                encryptedSecret: "6db833ba298b830d131566d6ceede5280504b461"
            }
        },
        database: {
            dialect: 'mysql',
            host: 'localhost',
            dbName: 'gestaon-dev',
            user: 'rootx',
            password: 'atrroot'
        },
        mongoDb: {
            host: 'localhost',
            dbName: 'GestaON'
        },
        pubNub: {
            subscribeKey: "sub-c-ddbbcb76-eec5-11e6-889b-02ee2ddab7fe",
            publishKey: "pub-c-5d6cc830-62a4-484e-885b-9a8180819e46",
            uuid: "server-" + utils.createId()
        },
        elasticSearch: {
            host: 'localhost',
            port: 9200,
            requestTimeout: 5000
        },
        protocols: [
            {name: 'gps103', port: 6001, debug: false},
            /*{name: 'tk103', port: 6002},
            {name: 'gt06', port: 6023},*/
            {name: 'tlt2h', port: 6030, debug: false},
            {name: 'agiliza', port: 6150, debug: false},
            {name: 'osmand', port: 6055, debug: false}
        ],
        redis: {
            active: false
        }
    };
}