const utils = require('../utils')
const _ = require('lodash')
const shortid = require('shortid')
const Controller = require('./../models/Controller')

module.exports = (server) => {

    return {

        ////////////////
        ///   CRUD   ///
        ////////////////
        //

        consultSection: (controller) => {
            return server.mongodb.Section.findOne({ companyId: controller.request.companyId }).sort({ position: 1 }).then((section) => {
                if(!section) {
                    // criar sessão
                }
                else {
                    return section
                }
            }).catch((err) => {
                return err
            })
        },

        // <-- end CRUD


    } // <-- end RETURN

} // <-- end EXPORTS