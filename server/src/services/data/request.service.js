import _ from 'lodash'

module.exports = (server) => { return {
    name: "data/request",
    actions: {
        get(ctx) {
        },
        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        list(ctx){
            return server.mysql.Request.findAll({
                where: ctx.params.where || {},
                include: ctx.params.include || []
            })
        },
        create(ctx){

        },
        update(ctx){

        },
        remove(ctx){

        },

        // request-client-address

        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        setRequestClientAddresses(ctx){

        },

        // request-client-phone

        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        setRequestClientPhones(ctx){

        },

        // request-timeline

        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        changeStatus(ctx){

        },
        /**
         * @param {Object} where, {Array} include
         * @returns {Promise.<Array>} requests
         */
        changeUser(ctx){
g
        }
    }
}}