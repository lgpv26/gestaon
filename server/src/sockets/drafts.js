const basePath = require('./../middlewares/base-path.middleware');
const _ = require('lodash');

module.exports = (server, channels, socket) => {

    const draftsController = require('./../controllers/drafts.controller')(server);

    socket.user.companies.forEach((company) => {
        server.mongodb.Draft.find({
            companyId: company
        }).exec().then((drafts) => {
            drafts.forEach((draft) => {
                socket.join('draft/' + draft.draftId);
            });
        }).catch((err) => {
            console.log(err);
        })
    })

    socket.on('presence-update-draft', (presenceUser) => {
        socket.join('presence-draft/' + presenceUser.draftId)
        let objPresenceUser = {}

        if (presenceUser.userId === socket.user.id) {
            objPresenceUser.name = socket.user.name
            objPresenceUser.email = socket.user.email
        }

        let draft = _.find(channels.presences.drafts, { draftId: presenceUser.draftId })
        if (draft) {
            const presenceUserIndex = channels.presences.drafts.indexOf(draft)
            const repeatUser = _.find(channels.presences.drafts[presenceUserIndex].users, (user) => {
                return JSON.stringify(user) === JSON.stringify(objPresenceUser)
            })

            if (!repeatUser) channels.presences.drafts[presenceUserIndex].users.push(objPresenceUser)

        }
        else {
            draft = { draftId: presenceUser.draftId, users: [objPresenceUser] }
            channels.presences.drafts.push(draft)
        }

        socket.on('disconnect', () => {
            _.map(channels.presences.drafts, (tempDraft) => {
                const userFound = _.some(tempDraft.users, (disconnectUser) => {
                    if (disconnectUser.name === socket.user.name && disconnectUser.email === socket.user.email) {
                        return true
                    }
                })
                tempDraft.users = _.filter(tempDraft.users, (disconnectUser) => {
                    return (disconnectUser.name !== socket.user.name && disconnectUser.email !== socket.user.email)
                })
                if (userFound) server.io.in('presence-draft/' + tempDraft.draftId).emit('presenceDraft', tempDraft.users)
                return tempDraft
            })
        })

        if (presenceUser.leave) {
            socket.leave('presence-draft/' + presenceUser.draftId)
            draft = _.find(channels.presences.drafts, { draftId: presenceUser.draftId })

            _.map(draft.users, (user, index) => {
                if (JSON.stringify(user) === JSON.stringify(objPresenceUser)) {
                    draft.users.splice(index, 1)
                }
            })
        }
        
        server.io.in('presence-draft/' + presenceUser.draftId).emit('presenceDraft', draft.users)
    })

    let timer = null;
    let draftUpdate = []

    socket.on('update-draft', (contentDraft) => {
        
        socket.broadcast.in('draft/' + contentDraft.draftId).emit('updateDraft', contentDraft)

        const draft = _.find(draftUpdate, { draftId: contentDraft.draftId })
        if (draft) {
            const draftUpdateIndex = draftUpdate.indexOf(draft);
            draftUpdate[draftUpdateIndex] = _.mergeWith(draft, contentDraft)
        }
        else {
            draftUpdate.push(contentDraft)
        }

        if (timer) clearTimeout(timer)
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