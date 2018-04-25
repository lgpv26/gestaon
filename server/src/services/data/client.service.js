module.exports = (server) => { return {
    name: "data/client",
    actions: {
        search(){

        },
        /**
         * @param {Object} id, companyId
         * @returns {Promise.<Array>} requests
         */
        get(ctx) {
            return server.mysql.Client.findOne({
                where: {
                    id: ctx.params.data.id,
                    companyId: ctx.params.data.companyId
                },
                include: [{
                    model: server.mysql.ClientPhone,
                    as: 'clientPhones'
                }, {
                    model: server.mysql.ClientAddress,
                    as: 'clientAddresses',
                    include: [{
                        model: server.mysql.Address,
                        as: 'address'
                    }]
                }, {
                    model: server.mysql.ClientCustomField,
                    as: 'clientCustomFields',
                    include: [{
                        model: server.mysql.CustomField,
                        as: 'customField'
                    }]
                }, {
                    model: server.mysql.ClientGroup,
                    as: 'clientGroup'
                }]
            }).then((client) => {
                  return JSON.parse(JSON.stringify(client))
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