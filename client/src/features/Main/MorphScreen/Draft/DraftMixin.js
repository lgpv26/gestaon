import _ from 'lodash'
import utils from '@/utils'

export default {
    data(){
        return {
            reloadDraftTimeout: null
        }
    },
    methods: {
        syncMultiple(array){
            const sendArray = []
            array.forEach((syncItem) => {
                if(!this.formPath){
                    const obj = {}
                    _.set(obj, syncItem.path, syncItem.data)
                    sendArray.push(obj)
                }
                else {
                    const obj = {}
                    _.set(obj, this.formPath + '.' + syncItem.path, syncItem.data)
                    sendArray.push(obj)
                }
            })
            const emitData = {
                draftId: this.activeMorphScreen.draft.draftId,
                data: sendArray
            }
            console.log("Emitting to draft.setData", emitData)
            this.$socket.emit('draft.setData', emitData)
        },
        syncKeyRemove(path){
            if(this.formPath){
                path = this.formPath + '.' + path
            }
            const emitData = {
                draftId: this.activeMorphScreen.draft.draftId,
                path
            }
            console.log("Emitting to draft.removeData", emitData)
            this.$socket.emit('draft.removeData', emitData)
        },
        sync(newData, path = null){
            const obj = {}
            if(!this.formPath){
                _.set(obj, path, newData)
            }
            else {
                _.set(obj, this.formPath + '.' + path, newData)
                console.log(obj)
            }
            const emitData = {
                draftId: this.activeMorphScreen.draft.draftId,
                data: obj
            }
            console.log("Emitting to draft.setData", emitData)
            this.$socket.emit('draft.setData', emitData)
        }
    },
    watch: {
        data(){
            if(_.has(this.data, this.formPath)) {
                const formData = utils.removeReactivity(_.get(this.data, this.formPath))
                this.form = _.assign(this.form, formData)
            }
            else {
                this.form = _.assign(this.form, {})
            }
        }
    }
}