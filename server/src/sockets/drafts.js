const basePath = require('./../middlewares/base-path.middleware');
const _ = require('lodash');

module.exports = class Drafts {

    constructor(server, channels, socket) {
        // global variabels
        this.server = server
        this.channels = channels
        this.socket = socket
        this.controller = require('./../controllers/drafts.controller')(server)
        
        // local variables
        this._timer = null; 
        this._draftUpdate = []

        // functions
        this.setSocketListeners()
    }

    setSocketListeners() {

        this.socket.on('presence-update-draft', (presenceUser) => {
            this.onPresenceUpdate(presenceUser)
        })
        
        this.socket.on('update-draft', (contentDraft) => {
            this.onUpdateDraft(contentDraft)
        })

        this.socket.on('disconnect', () => {
            this.onSocketDisconnect()
        })
    }

    onPresenceUpdate(presenceUser) { 
        this.socket.join('draft/' + presenceUser.draftId)
        this.socket.join('presence-draft/' + presenceUser.draftId)
        let objPresenceUser = {}

        if (presenceUser.userId === this.socket.user.id) {
            objPresenceUser.name = this.socket.user.name
            objPresenceUser.email = this.socket.user.email
        }

        let draft = _.find(this.channels.presences.drafts, { draftId: presenceUser.draftId })
        if (draft) {
            const presenceUserIndex = this.channels.presences.drafts.indexOf(draft)
            const repeatUser = _.find(this.channels.presences.drafts[presenceUserIndex].users, (user) => {
                return JSON.stringify(user) === JSON.stringify(objPresenceUser)
            })

            if (!repeatUser) this.channels.presences.drafts[presenceUserIndex].users.push(objPresenceUser)

        }
        else {
            draft = { draftId: presenceUser.draftId, users: [objPresenceUser] }
            this.channels.presences.drafts.push(draft)
        }

        if (presenceUser.leave) {
            this.socket.leave('presence-draft/' + presenceUser.draftId)
            draft = _.find(this.channels.presences.drafts, { draftId: presenceUser.draftId })

            _.map(draft.users, (user, index) => {
                if (JSON.stringify(user) === JSON.stringify(objPresenceUser)) {
                    draft.users.splice(index, 1)
                }
            })
        }
        this.server.io.in('presence-draft/' + presenceUser.draftId).emit('presenceDraft', draft.users)
    }

    onUpdateDraft(contentDraft) {
        this.socket.broadcast.in('draft/' + contentDraft.draftId).emit('updateDraft', contentDraft)

        const draft = _.find(this._draftUpdate, { draftId: contentDraft.draftId })
        if (draft) {
            const draftUpdateIndex = this._draftUpdate.indexOf(draft);
            this._draftUpdate[draftUpdateIndex] = _.mergeWith(draft, contentDraft)
        }
        else {
            this._draftUpdate.push(contentDraft)
        }

        if (this._timer) clearTimeout(this._timer)
        //TIMEOUT to save form in MONGO
        this._timer = setTimeout(() => {
            this._draftUpdate.forEach((du) => {
                this.controller.updateDraft(du).then(() => {
                    this.socket.emit('draftSaved')
                })
            })
            this._draftUpdate = []
        }, 3000)
    }


    onSocketDisconnect() {
        _.map(this.channels.presences.drafts, (tempDraft) => {
            const userFound = _.some(tempDraft.users, (disconnectUser) => {
                if (disconnectUser.name === this.socket.user.name && disconnectUser.email === this.socket.user.email) {
                    return true
                }
            })
            tempDraft.users = _.filter(tempDraft.users, (disconnectUser) => {
                return (disconnectUser.name !== this.socket.user.name && disconnectUser.email !== this.socket.user.email)
            })
            if (userFound) this.server.io.in('presence-draft/' + tempDraft.draftId).emit('presenceDraft', tempDraft.users)
            return tempDraft
        })
    }
}
/*

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
    
*/