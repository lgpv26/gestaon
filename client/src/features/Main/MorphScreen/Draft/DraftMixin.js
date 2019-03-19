import _ from 'lodash'
import utils from '../../../../utils'

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
                const baseFormPath = syncItem.customBaseFormPath || this.formPath
                if(!baseFormPath){
                    const obj = {}
                    obj.path = syncItem.path
                    obj.value = syncItem.value
                    sendArray.push(obj)
                }
                else {
                    const obj = {}
                    obj.path = baseFormPath + '.' + syncItem.path
                    obj.value = syncItem.value
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
        sync(newData, path = null, customBaseFormPath = null){
            const baseFormPath = customBaseFormPath || this.formPath
            const obj = {}
            if(!baseFormPath){
                obj.path = path
                obj.value = newData
            }
            else {
                obj.path = baseFormPath + '.' + path
                obj.value = newData
            }
            const emitData = {
                draftId: this.activeMorphScreen.draft.draftId,
                data: obj
            }
            console.log("Emitting to draft.setData", emitData)
            this.$socket.emit('draft.setData', emitData)
        },
        syncKeyRemove(key, path, customBaseFormPath = null){
            const baseFormPath = customBaseFormPath || this.formPath
            if(!baseFormPath){
                path = this.formPath + '.' + path
            }
            else {
                if(baseFormPath !== '.'){
                    path = baseFormPath + '.' + path
                }
            }
            const emitData = {
                draftId: this.activeMorphScreen.draft.draftId,
                data: {
                    remove: true,
                    path,
                    key
                }
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