import _ from 'lodash'
import moment from "moment"

module.exports = (server) => { 
    return {
        name: "utils",
        actions: {
            consultHolidays(ctx){
                const vm = this
                return new Promise(async (resolve, reject) => {
                    try {
                        const holidays = await vm.consultCompanyHolidays(1 /* ctx.params.companyId*/) //alterar o companyId
                        return resolve(holidays)
                    }
                    catch (err) {
                        console.log(err)
                        reject()
                    }
                })
            },

            setHolidays(ctx){
                const vm = this
                return new Promise(async (resolve, reject) => {
                    try {
                        const date = moment().toDate() // alterar a data que vem para a variavel
                        const holidays = await vm.consultCompanyHolidays(1 /* ctx.params.companyId*/) //alterar o companyId

                        let newHolidays = [moment(date).format("DD-MM")] // alterar a data que vem para a variavel
                        if(holidays){
                            for(const holiday of holidays){
                                newHolidays.push(moment(holiday, 'DD-MM-YYYY').format("DD-MM"))
                            }
                        }
                        await server.redisClient.hmset("holidays:companyId-" + 1 /* ctx.params.companyId*/, _.toString(moment(date).year()), _.toString(newHolidays), (err, res) => {
                            if (err) return Promise.reject("Erro no redis.")
                            return Promise.resolve()
                        })

                    }
                    catch (err) {
                        console.log(err)
                        reject()
                    }
                })
            }

        },

        methods: {
            consultCompanyHolidays(companyId) {
                return new Promise(async (resolve, reject) => {
                    const redisConsult = await server.redisClient.hgetall("holidays:companyId-" + _.toString(companyId))
                    if(_.isEmpty(redisConsult)) return resolve(null)
                    const data = redisConsult[moment().year()]
                    if(!data) return resolve(null)
                    
                    const holidays = _.map(data.split(","), (date) => {
                        return date + "-" + moment().year()
                    })                    
                    resolve(holidays)
                })
            }



        }

    }
}