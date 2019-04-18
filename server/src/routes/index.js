const fs = require('fs'),
    path = require('path')

import config from '../config'

import {HTTPError} from '~errors'

module.exports = function(server){

    /* import all route files */

    const allRouteFiles = fs.readdirSync(path.join(__dirname, '/')).filter((fileName) => {
        return fileName !== 'index.js'
    })

    allRouteFiles.forEach(function(fileName) {
        // Ignore this file and invalid ones
        if(fileName === 'index.js' || fileName.substr(0, 1) === '.' || fileName.substr(0, 1) === '_') {
            return;
        }
        // Require all files inside this directory
        require('./' + fileName)(server, server.restify)
    });

    /* uncategorized endpoints */

    server.get('/version', function(req, res, next){
        return res.send(200, {
            version: server.version,
            android: config.mainServer.androidVersion
        });
    });

    server.get('/lala', function(req, res, next){
        return server.mysql.RequestPayment.findAll({
            limit: 10,
            include: [
                {
                    model: server.mysql.Request,
                    as: 'request',
                    required: true,
                    include: [
                        {
                            model: server.mysql.RequestOrder,
                            as: 'requestOrder',
                            required: true,
                            include: [
                                {
                                    model: server.mysql.RequestOrderProduct,
                                    as: 'requestOrderProducts',
                                    where: {
                                        productId: 14
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }).then((result) => {
            res.send(200, result)
        }).catch((err) => {
            next(err)
        })
    });

    server.on('restifyError', function (req, res, err, cb) {
        err.toJSON = function customToJSON() {
            const errorBody = {
                success: false,
                error: {
                    message: err.message
                }
            }
            if(err.statusCode){
                errorBody.error.statusCode = err.statusCode
            }
            if(err.data){
                errorBody.error.data = err.data
            }
            if(err.code){
                errorBody.error.code = err.code
            }
            return errorBody
        };
        return cb()
    });

};
