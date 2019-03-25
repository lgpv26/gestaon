import _ from 'lodash'

module.exports = (server) => { 
    return {
        name: "cronJob",
        actions: {
            consult(ctx){
                return server.redisClient.get("cronJob:" + _.toString(ctx.params.cronJobName), (err, res) => {
                    if(res) return Promise.resolve(res)
                    return Promise.resolve(null)
                })
            },

            saveRedis(ctx){
                return server.redisClient.set("cronJob:" + _.toString(ctx.params.cronJobName), JSON.stringify({companyId: ctx.params.companyId, triggeredBy: ctx.params.triggeredBy.id}), (err, res) => {
                    if(res) return Promise.resolve()
                })
            },

            checkJob(ctx){
                return new Promise((resolve, reject) => {
                    if(server.jobs[ctx.params.cronJobName]) {
                        return resolve(true)
                    } 
                    else{
                        return resolve(null)
                    }
                })
            },

            createChatJob(ctx){
                const vm = this
                return new Promise((resolve, reject) => {
                    server.jobs[_.toString(ctx.params.cronJobName)] = new server.cronJob('*/15 * * * * *', function() {
                        console.log('Checando o ' + _.toString(ctx.params.cronJobName) + " às ", new Date())
                    
                            server.redisClient.get(_.toString(ctx.params.cronJobName).replace("/",":"), (err, res) => {
                                if(res) {
                                    server.redisClient.get("chat:" + _.toString(ctx.params.cronJobName), (err, chats) => {
                                        if(chats) {
                                            async function start() {
                                                await server.broker.call("data/chat-queue.start", {
                                                    data: JSON.parse(chats),
                                                    user: ctx.params.triggeredBy,
                                                    companyId: ctx.params.companyId
                                                })
        
                                                await server.broker.call("cronJob.stop", {cronJobName: ctx.params.cronJobName})
                                                await server.broker.call("cronJob.delete", {cronJobName: ctx.params.cronJobName})
                                                server.redisClient.del("chat:" + _.toString(ctx.params.cronJobName), (err, res) => {
                                                    console.log("End job")
                                                    return Promise.resolve()
                                                })
                                            }
                                            start()
                                        }                                        
                                    })                           
                                }
                                return resolve()
                            }) 
                        })
                    
                    return resolve()
                    
                })
            },

            backup(ctx){
                return new Promise(async (resolve, reject) => {
                    let promiseRotines = []
                    ctx.params.rotines.forEach((rotine, index) => {
                        promiseRotines.push(new Promise(async (resolve,reject) => {
                            const name = "backupRotine" + (index + 1)
                            server.jobs[name] = new server.cronJob(rotine, async function() {
                                await server.broker.call("backup.start")
                                return Promise.resolve()
                            })
                            return resolve()
                        }))
                    })                    
                    await Promise.all(promiseRotines)
                    return resolve()

                })
                .then(() => {
                    ctx.params.rotines.forEach((rotine, index) => {
                        server.jobs["backupRotine" + (index + 1)].start()
                    })
                })
            },

            start(ctx){
                return new Promise((resolve, reject) => {
                    server.jobs[_.toString(ctx.params.cronJobName)].start()
                    return resolve()
                })                
            },

            stop(ctx){
                return new Promise((resolve, reject) => {
                    server.jobs[_.toString(ctx.params.cronJobName)].stop()
                    return resolve()
                })                
            },

            delete(ctx){
                delete server.jobs[_.toString(ctx.params.cronJobName)] 
                return server.redisClient.del("cronJob:" + _.toString(ctx.params.cronJobName), (err, res) => {
                    return Promise.resolve()
                })
            }

        }
    }
}