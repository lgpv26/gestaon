import _ from 'lodash'
import config from '~config'


module.exports = (server) => {
    return {
        name: "socket",
        actions: {

            control(ctx) {
                if(ctx.params.ignore) return Promise.resolve() 
                return server.io.of('/').adapter.clientRooms(ctx.params.socketId, (err, rooms) => {
                    if (err) return Promise.reject('erro no redis + socket io')
                    rooms.splice(0,1)
                    const index = _.indexOf(rooms, 'company/' + ctx.params.companyId)
                    if(index !== -1) rooms.splice(index,1)

                    if(!rooms.length) {
                        return server.redisClient.hdel("userId:" + _.toString(ctx.params.userId), "rooms", (err, res) => {
                            if (err) {
                                console.log('Erro no redis.')
                                return Promise.reject('Erro no redis.')
                            }
                            else {
                                return Promise.resolve() 
                            }
                        })
                    } 
                    else {
                        return server.redisClient.hmset("userId:" +  ctx.params.userId, 'rooms', rooms.toString(), (err, res) => {
                            if (err) {
                                console.log('Erro no redis.')
                                return Promise.reject('Erro no redis.')
                            }
                            else {
                                return Promise.resolve() 
                            }
                        })
                    }
                })   
            },

            consult(ctx){
                return server.redisClient.hgetall(_.toString(ctx.params.key), (err, redisConsult) => {
                    if (err) {
                        return Promise.reject('Erro na consulta')
                    }
                    else {
                        if(!redisConsult) return Promise.resolve()
                        return Promise.resolve(redisConsult)
                    }
                })
            },

            checkSocketId(ctx){
                return new Promise((resolve, reject) => {
                    var stream = server.redisClient.scanStream({
                        match: 'socket:*'
                    })
                    stream.on('data', (resultKeys) => {
                        if (resultKeys.length) {
                            resultKeys.forEach((key, index) => {
                                server.redisClient.get(_.toString(key), (err, res) => {
                                    if(_.parseInt(res) === ctx.params.userId) return resolve(key.replace("socket:", ""))
                                    if(resultKeys.length === (index + 1)) return resolve()
                                })
                            })
                        }
                    })
                })
            },


            active(ctx){
                return server.redisClient.set("socket:" + _.toString(ctx.params.activeSocketId), _.toString(ctx.params.userId), (err, res) => {
                    if (err) {
                        console.log('Erro no redis.')
                        return Promise.reject('Erro no redis.')
                    }
                    else {
                        return Promise.resolve() 
                    }
                })
            },

            cleanRedis(ctx){
                var stream = server.redisClient.scanStream({
                    match: 'socket:*'
                })

                const promises = []

                stream.on('data', (resultKeys) => {
                    if (resultKeys.length) {
                        resultKeys.forEach((key) => {
                            promises.push(new Promise((resolve, reject) => {
                                return server.redisClient.del(_.toString(key), (err, res) => {
                                    if (err) {
                                        console.log('Erro no redis, ao setar sockets.')
                                        return reject()
                                    }
                                    else {
                                        return resolve() 
                                    } 
                                })
                            }))
                        })
                    }
                })
                return Promise.all(promises)
            },

            remove(ctx){
                return server.redisClient.del("socket:" + _.toString(ctx.params.activeSocketId), (err, res) => {
                    if (err) {
                        console.log('Erro no redis.')
                        return Promise.reject('Erro no redis.')
                    }
                    else {
                        return Promise.resolve() 
                    }
                })
            }


        }
    }
}