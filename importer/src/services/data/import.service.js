import _ from 'lodash'
var Op = require('sequelize').Op


module.exports = (server) => { return {
    name: "data/import",
    actions: {
        getOne(ctx) {
           
        },
        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        list(ctx){
            return server.importer.clientes.findAll({
                where: ctx.params.where || {},
                include: ctx.params.include || [],
                limit: ctx.params.limit || null,
                offset: ctx.params.offset || null
            }).then((list) => {
                return JSON.parse(JSON.stringify(list))
            })
        },
        count(ctx){
            return server.importer.clientes.count().then((count) => {
                return count
            })
        },
        /**
         * @param {Object} data, {Object} transaction
         * @returns {Promise.<Object>} request 
         */
        create(ctx) {
            
        },
        /**
         * @param {Object} data, {Object} where, {Object} transaction
         * @returns {Promise.<Object>} request 
         */
        update(ctx) {
            
        },
        remove(ctx){

        }

    }
}}