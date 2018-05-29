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
                <span class="summary__info">Iniciado às <em>{{ formatedCreatedAt }}</em> por <em>{{ screen.draft.createdBy }}</em></span>
            </div>
            <span class="push-both-sides"></span>
            <div class="header__tags" v-if="tags.length">
                <span>Termos da busca: </span>
                <ul>
                    <li class="copiable-content" v-for="tag in tags" :data-clipboard-text="tag"><span>{{ tag }}</span><icon-copy></icon-copy></li>
                </ul>
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
        <span v-show="!draft">Carregando...</span>
        <component :is="'app-' + details.entryComponent" v-show="draft" ref="draftRootComponent" @close="$emit('closeMorphScreen', $event)"></component>
    </div>
</template>

<script>
    import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
    import _ from 'lodash';
    import anime from 'animejs';
    import moment from 'moment';
    import Clipboard from 'clipboard';

    import DraftDependencyDataMixin from "./DraftDependencyDataMixin"
    import ClientForm from "./Client/ClientForm.vue";
    import RequestForm from "./Request/RequestForm.vue";
    import ExpenseForm from "./Expense/ExpenseForm.vue";
    import AccountsForm from "./Accounts/AccountsForm.vue";

    export default {
        components: {
            "app-request-form": RequestForm,
            "app-client-form": ClientForm,
            "app-accounts-form": AccountsForm,
            "app-expense-form": ExpenseForm,
        },
        data(){
            return {
                selectedContent: null,
                clipboardInstance: null,
                isPersisting: false,
                persistingText: "Salvando...",
                draft: null,
                loadPromises: []
            }
        },
        mixins: [DraftDependencyDataMixin],
        props: ['details','screen'],
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen','tags']),
            ...mapState('morph-screen', ['screens','isShowing']),
            ...mapState('auth', [
                'user', 'token', 'company'
            ]),
            formatedCreatedAt(){
                return moment(this.activeMorphScreen.draft.createdAt).format("DD/MM/YYYY HH:mm")
            }
        },
        methods: {

            // <editor-fold desc="Vuex">
            // </editor-fold>

            ...mapMutations('morph-screen', ['SET_ALL_MS_SCREENS','SET_MS','SHOW_MS', 'ADD_DRAFT']),
            ...mapActions('morph-screen', ['createMorphScreen']),
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
                    }
                }))

                // verify if draft data and dependency data returned correctly through events
                Promise.all(this.loadPromises).then(([draft,dependencyData]) => {
                    vm.draft = draft
                    vm['load' + _.upperFirst(_.camelCase(draft.type)) + 'DependencyData'](dependencyData)
                    vm.$refs.draftRootComponent.loadData(draft.data)
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
            leaveDraft(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                }
                console.log("Emitting to draft.leave", emitData)
                this.$socket.emit('draft.leave', emitData)
                this.$emit('closeDraft')
            }

        },
        created(){
            const vm = this
            /**
             * Load draft again on reconnect
             */
            vm.$socket.on('reconnect', (reason) => {
                vm.load()
            })
            vm.load()
        },
        mounted(){
            const vm = this
            vm.clipboardInstance = new Clipboard('.copiable-content')
        }
    }
</script>

<style>
    @import '../../../../assets/styles/draft.scss';
</style>
