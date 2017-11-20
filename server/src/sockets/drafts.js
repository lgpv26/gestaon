const basePath = require('./../middlewares/base-path.middleware');
const _ = require('lodash');

module.exports = (server, socket, company) => {
    
    const draftsController = require('./../controllers/drafts.controller')(server);

    server.mongodb.Draft.find({
        companyId: company.id
    }).exec().then((drafts) => {
        drafts.forEach((drafts) => {
            socket.join('draft/' + drafts.draftId);
        });
    }).catch((err) => {
        console.log(err);
    });

    let timer = null;
    let draftUpdate = []
    
    socket.on('update-draft', (contentDraft) => {
        socket.broadcast.in('draft/' + contentDraft.draftId).emit('updateDraft', contentDraft)

        const draft = _.find(draftUpdate, {draftId: contentDraft.draftId})
        if(draft) {
            const draftUpdateIndex = draftUpdate.indexOf(draft);
            draftUpdate[draftUpdateIndex] = _.mergeWith(draft, contentDraft)
        }
        else {
            draftUpdate.push(contentDraft)
        }

        if(timer) clearTimeout(timer) 
        //TIMEOUT to save form in MONGO
        timer = setTimeout(() => {
            draftUpdate.forEach((du) => {
                draftsController.updateDraft(du).then(() => {
                    socket.emit('draftSaved')
                })
            })
            draftUpdate = []
        }, 3000)
    })

};