<template>
    <div id="draft">
        <div class="container__header">
            <div class="header__summary">
                <h1 class="summary__title" ref="title">
                    {{ details.text }}
                    <span class="title__draft-or-definitive">Rascunho</span>
                    <span class="title__draft-id">#{{ screen.draft.draftId }}</span>
                    <icon-log style="margin-left: 3px; position: relative; top: 1px;"></icon-log>
                </h1>
                <span class="summary__info">Iniciado às <em>{{ formatedCreatedAt }}</em> por <em>{{ draftCreatedBy }}</em></span>
            </div>
            <span class="push-both-sides"></span>
            <div class="header__tags" v-if="tags.length && _.first(tags)">
                <span>Termos da busca: </span>
                <ul>
                    <li class="copiable-content" v-for="(tag, index) in tags" :key="index" :data-clipboard-text="tag"><span>{{ tag }}</span><icon-copy></icon-copy></li>
                </ul>
            </div>
            <div class="header__phone-line" v-if="_.get(draft, 'data.request.phoneLine', false)">
                <span>Linha: <em>{{ draft.data.request.phoneLine }}</em></span>
            </div>
            <div class="header__actions">
                <a @click="load()" style="margin-right: 20px; font-size: 34px; position: relative; top: 3px;"><i class="mi mi-refresh"></i></a>
                <div class="actions__draft-menu" @click="leaveDraft()">
                    <div class="count">
                        <span>{{ screens.length }}</span>
                    </div>
                    <icon-draft-list class="icon--primary"></icon-draft-list>
                </div>
            </div>
        </div>
        <div v-if="loading" class="loading-container">
            <div class="loading-icon-container">
                <div class="cssload-loader">
                    <div class="cssload-inner cssload-one"></div>
                    <div class="cssload-inner cssload-two"></div>
                    <div class="cssload-inner cssload-three"></div>
                </div>
            </div>
            <h3>Carregando rascunho...</h3>
        </div>
        <div v-if="errorMessage" class="load-error-container">
            <h3>{{ errorMessage }}</h3>
        </div>
        <component :is="'app-' + details.entryComponent" v-show="draft" ref="draftRootComponent" @remove="remove()" @close="emitDraftLeave(); leaveDraftAndCloseMorphScreen($event)"></component>
    </div>
</template>

<script>
    import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
    import _ from 'lodash';
    import moment from 'moment';
    import Clipboard from 'clipboard';

    import DraftDependencyDataMixin from "./DraftDependencyDataMixin"
    import RequestForm from "./Request/RequestForm.vue";

    export default {
        components: {
            "app-request-form": RequestForm
        },
        data(){
            return {
                currentDraft: null,
                selectedContent: null,
                clipboardInstance: null,
                isPersisting: false,
                persistingText: "Salvando...",
                loading: true,
                errorMessage: null,
                draft: null,
                loadPromises: []
            }
        },
        mixins: [DraftDependencyDataMixin],
        props: ['details','screen'],
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen','tags']),
            ...mapState('morph-screen', ['screens','isShowing']),
            ...mapState('auth', ['user', 'tokens', 'company']),
            ...mapState('data/users', ['users']),
            formatedCreatedAt(){
                return moment(this.activeMorphScreen.draft.createdAt).format("DD/MM/YYYY HH:mm")
            },
            draftCreatedBy(){
                if(_.isInteger(this.screen.draft.createdBy)){
                    const createdBy = _.find(this.users, {id: this.screen.draft.createdBy})
                    if(createdBy){
                        return _.get(createdBy,'name', '...')
                    }
                    return "..."
                }
                else {
                    return this.screen.draft.createdBy
                }
            }
        },
        methods: {

            // <editor-fold desc="Vuex">
            // </editor-fold>

            ...mapMutations('morph-screen', ['SET_ALL_MS_SCREENS','SET_MS','SHOW_MS', 'ADD_DRAFT']),
            ...mapActions('morph-screen', ['createMorphScreen','removeDraft']),
            ...mapActions('toast', ['showToast']),
            ...mapActions('loading', ['startLoading','setLoadingText']),

            /**
             * Component methods
             */

            load(){
                const vm = this

                // clean all promises and event listeners

                vm.loadPromises = []
                if(vm.$options.sockets['draft.load']){
                    delete vm.$options.sockets['draft.load'] // remove previous set listener if existent
                }
                if(vm.$options.sockets['draft/' + this.activeMorphScreen.draft.type + '.load']){
                    delete vm.$options.sockets['draft/' + this.activeMorphScreen.draft.type + '.load']  // remove previous set listener if existent
                }

                // push event listeners inside promises to resolve the draft load and the dependency data together
                vm.loadPromises.push(new Promise((resolve, reject) => {
                    /**
                     * On active step change
                     * @param {Object} ev = { success:Boolean, evData:Draft }
                     */
                    vm.$options.sockets['draft.load'] = (ev) => {
                        console.log("Received draft.load", ev)
                        if(ev.success){
                            resolve(ev.evData)
                        }
                        else {
                            reject(ev.error.message)
                        }
                    }
                }))
                vm.loadPromises.push(new Promise((resolve, reject) => {
                    /**
                     * On active step change
                     * @param {Object} ev = { success:Boolean, evData:Draft }
                     */
                    vm.$options.sockets['draft/' + this.activeMorphScreen.draft.type + '.load'] = (ev) => {
                        console.log("Received draft/" + this.activeMorphScreen.draft.type + ".load", ev)
                        if(ev.success){
                            resolve(ev.evData)
                        }
                        else {
                            reject(ev.error.message)
                        }
                    }
                }))

                // verify if draft data and dependency data returned correctly through events
                Promise.all(this.loadPromises).then(([draft,dependencyData]) => {
                    vm.loading = false
                    vm.errorMessage = null
                    vm.draft = draft
                    vm['load' + _.upperFirst(_.camelCase(draft.type)) + 'DependencyData'](dependencyData)
                    vm.$refs.draftRootComponent.loadData(draft.data)
                }).catch((errorMessage) => {
                    vm.loading = false
                    vm.errorMessage = errorMessage
                })

                // emit the event to load draft data and dependency data to the server
                const emitDraftLoad = {
                    draftId: this.activeMorphScreen.draft.draftId
                }
                console.log("Emitting to draft.load", emitDraftLoad)
                this.$socket.emit('draft.load', emitDraftLoad)

                const emitDraftDependencyDataLoad = {
                    draftId: this.activeMorphScreen.draft.draftId
                }
                console.log("Emitting to draft/" + this.activeMorphScreen.draft.type + ".load", emitDraftDependencyDataLoad)
                this.$socket.emit("draft/" + this.activeMorphScreen.draft.type + ".load", emitDraftDependencyDataLoad)
            },
            remove(){
                const vm = this
                vm.removeDraft({
                    draftId: this.activeMorphScreen.draft.draftId,
                    companyId: this.company.id
                }).then(() => {
                    vm.showToast({
                        type: 'success',
                        message: "Rascunho removido!"
                    })
                    vm.leaveDraftAndCloseMorphScreen({
                        remove: true
                    })
                }).catch((err) => {
                    vm.showToast({
                        type: 'error',
                        message: err
                    })
                })
            },
            emitDraftLeave(){
                const emitData = {
                    draftId: this.currentDraft.draftId
                }
                console.log("Emitting to draft.leave", emitData)
                this.$socket.emit('draft.leave', emitData)
            },
            leaveDraft(){
                this.emitDraftLeave()
                this.$emit('closeDraft')
            },
            leaveDraftAndCloseMorphScreen(ev = {}){
                const closeMorphScreenEvData = _.assign({
                    draftId: this.currentDraft.draftId,
                    remove: false
                }, ev)
                this.$emit('closeMorphScreen', closeMorphScreenEvData)
            },
            connect(){
                if(this.activeMorphScreen){
                    setTimeout(() => {
                        this.load()
                    }, 200)
                }
            }
        },
        created(){
            const vm = this
            /**
             * Load draft again on reconnect
             */
            vm.$socket.on('connect', this.connect)
            vm.load()
        },
        mounted(){
            const vm = this
            vm.clipboardInstance = new Clipboard('.copiable-content')
            vm.currentDraft = JSON.parse(JSON.stringify(this.activeMorphScreen.draft))
        },
        beforeDestroy(){
            this.$socket.removeListener('connect', this.connect)
        }
    }
</script>

<style>
    @import '../../../../assets/styles/draft.scss';

    #draft .header__phone-line {
        margin-left: 40px;
    }

    .loading-container, .load-error-container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
        flex-direction: row;
    }

    .loading-icon-container {
        align-self: center;
        margin-right: 20px;
    }

    .cssload-loader {
        position: relative;
        left: calc(50% - 31px);
        width: 62px;
        height: 62px;
        border-radius: 50%;
        -o-border-radius: 50%;
        -ms-border-radius: 50%;
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        perspective: 780px;
    }

    .cssload-inner {
        position: absolute;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        -o-box-sizing: border-box;
        -ms-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        border-radius: 50%;
        -o-border-radius: 50%;
        -ms-border-radius: 50%;
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
    }

    .cssload-inner.cssload-one {
        left: 0%;
        top: 0%;
        animation: cssload-rotate-one 1.15s linear infinite;
        -o-animation: cssload-rotate-one 1.15s linear infinite;
        -ms-animation: cssload-rotate-one 1.15s linear infinite;
        -webkit-animation: cssload-rotate-one 1.15s linear infinite;
        -moz-animation: cssload-rotate-one 1.15s linear infinite;
        border-bottom: 3px solid rgb(255,255,255);
    }

    .cssload-inner.cssload-two {
        right: 0%;
        top: 0%;
        animation: cssload-rotate-two 1.15s linear infinite;
        -o-animation: cssload-rotate-two 1.15s linear infinite;
        -ms-animation: cssload-rotate-two 1.15s linear infinite;
        -webkit-animation: cssload-rotate-two 1.15s linear infinite;
        -moz-animation: cssload-rotate-two 1.15s linear infinite;
        border-right: 3px solid rgb(255,255,255);
    }

    .cssload-inner.cssload-three {
        right: 0%;
        bottom: 0%;
        animation: cssload-rotate-three 1.15s linear infinite;
        -o-animation: cssload-rotate-three 1.15s linear infinite;
        -ms-animation: cssload-rotate-three 1.15s linear infinite;
        -webkit-animation: cssload-rotate-three 1.15s linear infinite;
        -moz-animation: cssload-rotate-three 1.15s linear infinite;
        border-top: 3px solid rgb(255,255,255);
    }

    @keyframes cssload-rotate-one {
        0% {
            transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
        }
        100% {
            transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
        }
    }

    @-o-keyframes cssload-rotate-one {
        0% {
            -o-transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
        }
        100% {
            -o-transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
        }
    }

    @-ms-keyframes cssload-rotate-one {
        0% {
            -ms-transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
        }
        100% {
            -ms-transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
        }
    }

    @-webkit-keyframes cssload-rotate-one {
        0% {
            -webkit-transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
        }
        100% {
            -webkit-transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
        }
    }

    @-moz-keyframes cssload-rotate-one {
        0% {
            -moz-transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
        }
        100% {
            -moz-transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
        }
    }

    @keyframes cssload-rotate-two {
        0% {
            transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
        }
        100% {
            transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
        }
    }

    @-o-keyframes cssload-rotate-two {
        0% {
            -o-transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
        }
        100% {
            -o-transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
        }
    }

    @-ms-keyframes cssload-rotate-two {
        0% {
            -ms-transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
        }
        100% {
            -ms-transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
        }
    }

    @-webkit-keyframes cssload-rotate-two {
        0% {
            -webkit-transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
        }
        100% {
            -webkit-transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
        }
    }

    @-moz-keyframes cssload-rotate-two {
        0% {
            -moz-transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
        }
        100% {
            -moz-transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
        }
    }

    @keyframes cssload-rotate-three {
        0% {
            transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
        }
        100% {
            transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
        }
    }

    @-o-keyframes cssload-rotate-three {
        0% {
            -o-transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
        }
        100% {
            -o-transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
        }
    }

    @-ms-keyframes cssload-rotate-three {
        0% {
            -ms-transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
        }
        100% {
            -ms-transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
        }
    }

    @-webkit-keyframes cssload-rotate-three {
        0% {
            -webkit-transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
        }
        100% {
            -webkit-transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
        }
    }

    @-moz-keyframes cssload-rotate-three {
        0% {
            -moz-transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
        }
        100% {
            -moz-transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
        }
    }
</style>
