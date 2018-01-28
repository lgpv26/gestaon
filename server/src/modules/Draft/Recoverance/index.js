import { resolve } from 'dns';

const Drafts = require('../../../events/Draft/index')
const basePath = require('../../../middlewares/base-path.middleware')
const _ = require('lodash')

const draftsController = require('../../../controllers/drafts.controller')

module.exports = class Draft {

    constructor(server) {
        this.server = server;
        this.draftsController = draftsController(this.server);

    }

    getDraftById(draftId){
        return this.draftsController.getOne(draftId).then((draft) => {
            return JSON.parse(JSON.stringify(draft));
        }).catch((err) => {
            return err
        })
    }

};