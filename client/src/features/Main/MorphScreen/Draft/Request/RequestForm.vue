<template>
    <div ref="scrollbar">
        <div class="ms-form">
            <div class="ms-form__spinner" v-if="saving && !form.activeStep">
                <span>Salvando...</span>
            </div>
            <span style="position: absolute; top: 0; left: 2px;">
                <span style="color: rgba(255,255,255,.05); margin-right: 5px;" v-for="presenceUser in presenceUsers">{{ presenceUser.name }}</span>
            </span>
            <div class="form__instruction" v-if="!form.activeStep">
                <div class="instruction__container">
                    <div class="container__area">
                        <small>O que vamos fazer?</small>
                        <span>Monte o atendimento de forma ágil usando os painéis abaixo</span>
                    </div>
                    <img-request-form></img-request-form>
                </div>
            </div>
            <div class="separator" v-if="!form.activeStep"></div>
            <!-- Client form -->
            <form :class="{'active': this.form.activeStep === 'client'}">
                <div class="form__content" v-show=" this.form.activeStep === 'client'">
                    <app-client-form :client.sync="form.client" :data.sync="data"></app-client-form>
                </div>
                <div class="form__header" v-if="!this.form.activeStep === 'client' && client.id" :class="{'summary': !this.form.activeStep === 'client' && client.id}">
                    <div class="form-columns" style="flex-grow: 1;">
                        <div class="form-column" style="flex-grow: 1; flex-basis: 70%; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;">
                            <span style="margin-right: 8px;">{{ shortenedClientName }}</span>
                            <div v-if="selectedClientAddress">
                                <span style="margin-right: 8px;">{{ shortenedClientAddress }}</span>
                            </div>
                            <icon-edit style="width:10px;"></icon-edit>
                        </div>
                        <div class="form-column" v-if="selectedClientPhone">
                            <a class="btn btn--border-only" style="height: auto; padding: 5px 8px;">
                                <icon-phone class="icon--d-secondary" style="margin-right: 10px;"></icon-phone>
                                <span style="white-space: nowrap;">{{ formatedClientPhone }}</span>
                            </a>
                        </div>
                        <div class="form-column" v-if="client.clientGroup">
                            <app-select class="form-group__header" title="Grupo de cliente" :verticalOffset="8" :items="clientGroups" v-model="client.clientGroup" :showInput="true" @change="commitSocketChanges('client.clientGroup')">
                                <a class="btn btn--border-only" style="height: auto; padding: 5px 8px;">
                                    <div class="header__icon">
                                        <icon-client-group class="icon--d-secondary" style="margin-right: 10px;"></icon-client-group>
                                    </div>
                                    <span class="static" style="white-space: nowrap" v-if="!selectedClientGroup.value">Grupo de cliente</span>
                                    <span style="white-space: nowrap" v-else>{{ selectedClientGroup.text }}</span>
                                    <span class="push-both-sides"></span>
                                    <icon-dropdown class="header__action-icon"></icon-dropdown>
                                </a>
                                <template slot="item" slot-scope="itemProps">
                                    <span>{{itemProps.text }}</span>
                                </template>
                            </app-select>
                        </div>
                        <div class="form-column" style="flex-grow: initial; flex-direction: row; align-items: center;">
                            <h3 style="top: 0;">Cliente</h3> <app-switch style="float: right;" :value=" this.form.activeStep === 'client'" @change="onCurrentStepChanged()"></app-switch>
                        </div>
                    </div>
                </div>
                <div class="form__header" v-else>
                    <span v-if="!this.form.activeStep === 'client'">Incluir um <span style="color: var(--primary-color)">cliente</span> neste atendimento</span>
                    <span class="push-both-sides"></span>
                    <h3 :class="{active: this.form.activeStep === 'client'}">Cliente</h3> <app-switch style="float: right;" :value="this.form.activeStep === 'client'" @change="changeStep('client')"></app-switch>
                </div>
            </form>
            <div class="separator"></div>
            <!-- Order form -->
            <form :class="{'active': this.form.activeStep === 'order'}">
                <div class="form__content" v-show="this.form.activeStep === 'order'">
                    <app-order-form @step-change="onStepChange($event)" :order.sync="form.order"></app-order-form>
                </div>
                <div class="form__header">
                    <span v-if="!this.form.activeStep === 'order'">Incluir uma <span style="color: var(--secondary-color)">venda</span> neste atendimento</span>
                    <span class="push-both-sides"></span>
                    <h3 :class="{active: this.form.activeStep === 'order'}">Venda</h3> <app-switch style="float: right;" :value="this.form.activeStep === 'order'" @changed="changeStep('order')"></app-switch>
                </div>
            </form>
            <div class="separator"></div>
            <!-- Task form -->
            <form :class="{'active': this.form.activeStep === 'task'}">
                <div class="form__content" v-show="this.form.activeStep === 'task'">
                    <app-task-form @step-change="onStepChange($event)" :task.sync="form.task"></app-task-form>
                </div>
                <div class="form__header">
                    <span v-if="!this.form.activeStep === 'task'">Incluir uma <span style="color: var(--terciary-color)">tarefa</span> neste atendimento</span>
                    <span class="push-both-sides"></span>
                    <h3 :class="{active: this.form.activeStep === 'task'}">Tarefa</h3> <app-switch style="float: right;" :value="this.form.activeStep === 'task'" @changed="changeStep('task')"></app-switch>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import utils from '../../../../../utils/index'
    import _ from 'lodash';
    import ClientForm from './Client/ClientForm.vue';
    import OrderForm from './Order/OrderForm.vue';
    import TaskForm from './Task/TaskForm.vue';
    import Scrollbar from 'smooth-scrollbar';

    export default {
        components: {
            'app-client-form': ClientForm,
            'app-order-form': OrderForm,
            'app-task-form': TaskForm
        },
        props: ['form','data'],
        data(){
            return {
                scrollbar: null,
                presenceUsers: [],
                lastForm: null,
                draftId: null, // requestId
                originalId: null, // se estiver editando um draft originado de um dado já salvo no MySQL
                type: 'request',
                createdBy: null,
                createdAt: null,
                updatedAt: null,
                /*form: {
                    activeStep: null,
                    clientPhoneId: null,
                    clientAddressId: null,
                    client: {
                        id: null, // se passar, atualizar cliente. se não, criar.
                        name: '', // se passar e tiver id, atualizar. se não, criar.
                        clientGroup: null,
                        legalDocument: '', // cpf, cnpj
                        clientAddresses: [
                            {
                                active: false,
                                clientAddressId: null,
                                name: null,
                                number: null,
                                complement: null,
                                addressId: null, // o id do endereço salvo no MySQL (address).
                                type: ['billing','invoicing','delivery'], // billing - cobrança. invoicing - faturamento. delivery - entrega.
                                /!* salva no mysql -- nao no draft *!/
                                address: {
                                    companyId: null,
                                    id: null, // se passar, usar e ignorar os outros campos. se não, criar usando os outros dados do address.
                                    name: null,
                                    neighborhood: null,
                                    cep: null,
                                    city: null,
                                    state: null
                                },
                                /!* --- *!/
                            }
                        ],
                        clientPhones: [
                            {
                                ddd: null, // string
                                number: null, // string
                                name: null // string
                            }
                        ],
                        clientCustomFields: []
                    },
                    order: {
                        requestProducts: []
                    },
                    task: {
                        name: ''
                    }
                },*/
                saving: false
            }
        },
        computed: {
            ...mapState('auth', ['user']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
        },
        methods: {
            ...mapActions('toast', ['showToast']),
            ...mapActions('loading', ['stopLoading']),
            changeStep(step){
                let activeStep = null
                if(this.form.activeStep !== step){
                    if (this.form.activeStep !== 'client' && step === 'client') {
                        activeStep = 'client'
                    }
                    if (this.form.activeStep !== 'order' && step === 'order') {
                        activeStep = 'order'
                    }
                    if (this.form.activeStep !== 'task' && step === 'task') {
                        activeStep = 'task'
                    }
                }
                const emitData = {
                    draftId: this.activeMorphScreen.draft.draftId,
                    activeStep: activeStep
                }
                console.log("Emitting to draft/request.activeStep", emitData)
                this.$socket.emit('draft/request.activeStep', emitData)
            }
        },
        created(){
            const vm = this
            /**
             * On active step change
             * @param ev
             */
            vm.$options.sockets['draft/request.activeStep'] = (ev) => {
                console.log("Received draft/request.activeStep", ev)
                vm.form.activeStep = ev.evData.activeStep
            }
        },
        mounted(){
            this.scrollbar = Scrollbar.init(this.$refs.scrollbar, {
                overscrollEffect: 'bounce',
                alwaysShowTracks: true
            })
        },
        updated(){
            this.scrollbar.update()
        }
    }
</script>

<style>
    .form__header.summary {
        height: auto;
    }

    .form__header.summary >>> .colorizable {
        fill: var(--font-color--2);
    }

    .form__header.summary span {
        text-transform: uppercase;
        margin-right: 10px;
        color: var(--font-color--8)
    }

    .form__header.summary .form-group {
        padding: 0 20px;
        display: flex;
        height: 50px;
        align-items: center;
        flex-direction: row;
    }

    .form-groups {
        display: flex;
        flex-direction: row;
        margin-bottom: 10px;
    }

    .form-groups:last-child {
        margin-bottom: 0;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        background-color: var(--bg-color--8);
        padding: 15px 20px;
        flex-grow: 1;
        margin-right: 10px;
        border-radius: 5px;
    }

    .form-group:last-child {
        margin-right: 0;
    }

    .form-group .form-group__header {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-bottom: 15px;
        /*border-bottom: 1px dashed var(--border-color--2);*/
        background-image: linear-gradient(to right, var(--border-color--2) 50%, rgba(255,255,255,0) 0%);
        background-position: bottom left;
        background-size: 6px 2px;
        background-repeat: repeat-x;
        margin-bottom: 15px;
    }

    .form-group .form-group__header:last-child {
        background: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    .form-group .form-group__header > span {
    }

    .form-group .form-group__header h3 {
        font-size: 14px;
    }

    .form-group .form-group__header input[type=text] {
    }

    .form-group .form-group__header .header__icon {
        display: flex;
        flex-shrink: 0;
        margin-right: 10px;
        width: 20px;
    }

    .form-group .form-group__header .header__mini-circle {
        flex-shrink: 0;
        height: 4px;
        width: 4px;
        background-color: var(--font-color--7);
        border-radius: 2px;
        margin: 0 10px;
    }

    .form-group .form-group__header .header__action-icon {
        flex-shrink: 0;
    }

    .form-group .form-group__content > ul.content__list {
        display: flex;
        flex-direction: column;
    }

    .form-group .form-group__content ul.content__list li.list__item {
        display: flex;
        flex-direction: row;
        align-items: center;
        background-image: linear-gradient(to right, var(--border-color--2) 50%, rgba(255,255,255,0) 0%);
        background-position: bottom left;
        background-size: 6px 2px;
        background-repeat: repeat-x;
        position: relative;
        padding-bottom: 15px;
        margin-top: 13px;
    }

    .form-group .form-group__content li.list__item .item__icon {
        display: flex;
        align-items: center;
    }

    .form-group .form-group__content > ul.content__list > li.list__item.active span {
        color: var(--font-color--secondary);
    }

    .form-group .form-group__content > ul.content__list > li.list__item.active .item__check .colorizable {
        fill: var(--font-color--primary);
    }

    .form-group .form-group__content li.list__item .item__icon .colorizable {
        fill: var(--font-color--2);
    }

    .form-group .form-group__content > ul.content__list > li.list__item span {
        color: var(--font-color--7);
        font-size: 14px;
    }

    .form-group .form-group__content > ul.content__list > li.list__item:first-child {
        margin-top: -2px;
    }

    .form-group .form-group__content > ul.content__list > li.list__item:last-child {
        margin-bottom: 8px;
    }

    .form-group .form-group__content > ul.content__list > li.list__item > .item__mini-circle {
        flex-shrink: 0;
        height: 4px;
        width: 4px;
        background-color: var(--secondary-color);
        border-radius: 2px;
        margin: 0 10px;
    }

    .form-group .form-group__content > ul.content__list--mini {
        display: flex;
        flex-direction: column;
    }

    .form-group .form-group__content > ul.content__list--mini > li.list__item {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 5px;
    }

    .form-group .form-group__content > ul.content__list--mini > li.list__item .item__check {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 20px;
    }

    .form-group .form-group__content > ul.content__list--mini > li.list__item.active .item__check .colorizable {
        fill: var(--font-color--primary);
    }

    .form-group .form-group__content > ul.content__list--mini > li.list__item span {
        color: var(--font-color--7);
    }

    .form-group .form-group__content > ul.content__list--mini > li.list__item:last-child {
        margin-bottom: 0;
    }

    .form-group .form-group__content > ul.content__list--mini > li.list__item > .item__mini-circle {
        flex-shrink: 0;
        height: 4px;
        width: 4px;
        background-color: var(--secondary-color);
        border-radius: 2px;
        margin: 0 10px;
    }

    .form-columns {
        display: flex;
        flex-direction: row;
        margin-bottom: 15px;
    }

    .form-columns:last-child {
        margin-bottom: 0;
    }

    .form-column {
        display: flex;
        flex-direction: column;
        margin-right: 20px;
        justify-content: center;
    }

    .form-column label {
        margin-bottom: 3px;
    }

    .form-column:last-child {
        margin-right: 0px;
    }

    div.ms-form {
        padding: 0 20px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        position: relative;
    }
    div.ms-form div.ms-form { /* descendant ms-form's */
        padding: 0;
    }
    div.ms-form .ms-form__spinner {
        position: absolute;
        top: 8px;
        right: 20px;
    }
    div.ms-form .ms-form__spinner span {
        color: var(--primary-color)
    }
    div.ms-form .form__instruction {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 20px 0 20px;
        flex-shrink: 0;
        flex-grow: 1;
    }
    div.ms-form .form__instruction .instruction__container {
        position: relative;
    }
    div.ms-form .form__instruction .instruction__container > .container__area {
        position: absolute;
        display: flex;
        flex-direction: column;
        top: 74px;
        left: 24px;
        width: 210px;
    }
    div.ms-form .form__instruction .instruction__container > .container__area > small{
        font-size: 14px;
        margin-bottom: 3px;
    }
    div.ms-form .form__instruction .instruction__container > .container__area > span{
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-color);
        line-height: 120%;
    }
    div.separator {
        height: 5px;;
        background-color: var(--bg-color--7);
        flex-shrink: 0;
    }
    form .form__title {
        width: 100%;
        height: 40px;
    }
    div.ms-form form {
        display: flex;
        flex-direction: column;
        padding: 10px 0;
        flex-shrink: 0;
    }
    div.ms-form form:first-child {
        padding: 20px 0 10px!important;
    }
    div.ms-form form:last-child {
        padding-bottom: 12px;
    }
    div.ms-form form.active {
        flex-grow: 1;
        padding: 20px 0 10px;
    }
    div.ms-form form.active .form__content {
        flex-grow: 1;
    }
    div.ms-form .form__content {
        display: flex;
        flex-direction: row;
    }
    div.ms-form .form__main-column {
        flex-grow: 1;
    }
    div.ms-form form .form__header {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 24px;
    }
    div.ms-form form.active .form__header {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 24px;
        margin-top: 35px;
    }
    div.ms-form form .form__header h3 {
        font-size: 16px;
        margin-right: 10px;
        position: relative;
        color: var(--font-color--2);
        font-weight: initial;
    }
    div.ms-form form .form__header h3.active {
        color: var(--font-color--primary);
    }
    div.ms-form form .form__header > span {
        font-size: 14px;
    }
    div.ms-form form.active .form__header > span {
        font-size: 14px;
        color: var(--base-color--d);
    }
    div.ms-form form .form__header > span > span {
        font-size: 14px;
        font-weight: 600;
    }
    div.ms-form form .form__side-column {
        margin-left: 10px;
        width: 350px;
    }
</style>
