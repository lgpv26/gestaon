const Op = require('sequelize').Op

module.exports = (server) => { return {
    name: "data/address",
    actions: {
        search(){

        },
        /**
         * @param {Object} id, companyId
         * @returns {Promise.<Array>} requests
         */
        get(ctx) {
            return server.mysql.Address.findOne({
                where: {
                    id: ctx.params.data.id,
                    companyId: {
                        [Op.in]: [0, ctx.params.data.companyId]
                    } 
                }
            }).then((address) => {
                  return JSON.parse(JSON.stringify(address))
            })
        },
        list(ctx){

        },
        create(ctx){

        },
        update(ctx){

        },
        remove(ctx){

        }
    }
}}