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
                <a @click="loadDraft()" style="margin-right: 20px; font-size: 34px; position: relative; top: 3px;"><i class="mi mi-refresh"></i></a>
                <div class="actions__draft-menu" @click="leaveDraft()">
                    <div class="count">
                        <span>{{ screens.length }}</span>
                    </div>
                    <icon-draft-list class="icon--primary"></icon-draft-list>
                </div>
            </div>
        </div>
        <div class="container__body">
            <span v-show="!draft">Carregando...</span>
            <component :is="'app-' + details.entryComponent" v-show="draft" ref="draftRootComponent"></component>
        </div>
        <div class="container__actions">
            <a>Excluir Rascunho</a>
            <span class="push-both-sides"></span>
            <a style="margin-right: 20px;" @click="$emit('closeMorphScreen')">Voltar</a>
            <span style="margin-right: 20px;">(Preencha os campos obrigatórios <em>*</em> para salvar)</span>
            <a style="color: var(--font-color--primary)" @click="persistRequest()" v-if="!isPersisting">Salvar request</a>
            <a style="color: var(--font-color--primary)" v-else>{{ persistingText }}</a>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
    import _ from 'lodash';
    import anime from 'animejs';
    import moment from 'moment';
    import Clipboard from 'clipboard';

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
                remountTimeout: null
            }
        },
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

            loadDraft(){
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId
                }
                console.log("Emitting to draft.load", emitData)
                this.$socket.emit('draft.load', emitData)
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
             * On active step change
             * @param {Object} ev = { success:Boolean, evData:Draft }
             */
            vm.$options.sockets['draft.load'] = (ev) => {
                console.log("Received draft.load", ev)
                if(ev.success){
                    vm.draft = ev.evData
                    vm.$refs.draftRootComponent.loadData(ev.evData.data)
                }
            }
            /**
             * Load draft again on reconnect
             */
            vm.$socket.on('reconnect', (reason) => {
                vm.loadDraft()
            })
        },
        mounted(){
            const vm = this
            vm.clipboardInstance = new Clipboard('.copiable-content')
            vm.loadDraft()
        }
    }
</script>

<style>
    #draft {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }

    .container__header .header__summary > .summary__title {
        font-weight: 800;
        line-height: 120%;
        font-size: 14px;
        color: var(--terciary-color);
        text-transform: uppercase;
    }

    .container__header .header__summary > .summary__title .title__draft-or-definitive {
        text-transform: initial;
        font-weight: 600;
    }

    .container__header .header__summary > .summary__title .title__draft-id {
        color: var(--base-color);
        font-weight: 600;
    }

    .container__header .header__summary > .summary__info > em {
        font-style: initial;
        color: var(--primary-color);
        font-weight: 600;
    }
</style>
