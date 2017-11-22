<template>
    <div class="ms-form">
        <div class="ms-form__spinner" v-if="saving && !form.client.active && !form.order.active && !form.task.active">
            <span>Salvando...</span>
        </div>
        <div class="form__instruction" v-if="!form.client.active && !form.order.active && !form.task.active">
            <div class="instruction__container">
                <div class="container__area">
                    <small>O que vamos fazer?</small>
                    <span>Monte o atendimento de forma ágil usando os painéis abaixo</span>
                </div>
                <img-request-form></img-request-form>
            </div>
        </div>
        <div class="separator" v-if="!form.client.active && !form.order.active && !form.task.active"></div>
        <form :class="{'active': form.client.active}">
            <div class="form__content" v-show="form.client.active">
                <div class="form__main-column">
                    <div class="form-groups">
                        <div class="form-group">
                            Nome / Empresa
                            <input type="text" v-model="form.client.name" @input="sendSocket('client.name')" />
                        </div>
                        <div class="form-group">
                            CPF / CNPJ
                            <input type="text" v-model="form.client.legalDocument" @input="sendSocket('client.name')" />
                        </div>
                    </div>
                    <div class="form-groups">
                        <div class="form-group">
                            Locais
                        </div>
                    </div>
                    <div class="form-columns">
                        <div class="form-column">

                        </div>
                        <div class="form-column">

                        </div>
                    </div>
                </div>
                <div class="form__side-column">
                    <div class="form-groups">
                        <div class="form-group">
                            Locais
                        </div>
                    </div>
                    <div class="form-groups">
                        <div class="form-group">
                            Locais
                        </div>
                    </div>
                </div>
            </div>
            <div class="form__header">
                <span v-if="!form.client.active">Incluir um <span style="color: var(--primary-color)">cliente</span> neste atendimento</span>
                <span class="push-both-sides"></span>
                <h3>DADOS DO CLIENTE</h3> <app-switch style="float: right;" v-model="form.client.active" @changed="sendSocket('client.active')"></app-switch>
            </div>
        </form>
        <div class="separator"></div>
        <form :class="{'active': form.order.active}">
            <div class="form__content">
                <div class="form__main-column" v-show="form.order.active">
                    <div class="main-column__form">
                        <div class="columns">
                            <div class="column">
                                Nome / Empresa
                                <input type="text" v-model="form.order.name" @input="sendSocket('order.name')" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form__side-column">
                    <div class="side-column__header">
                    </div>
                </div>
            </div>
            <div class="form__header">
                <span v-if="!form.order.active">Incluir uma <span style="color: var(--secondary-color)">venda</span> neste atendimento</span>
                <span class="push-both-sides"></span>
                <h3>VENDA</h3> <app-switch style="float: right;" v-model="form.order.active" @changed="sendSocket('order.active')"></app-switch>
            </div>
        </form>
        <div class="separator"></div>
        <form :class="{'active': form.task.active}">
            <div class="form__content">
                <div class="form__main-column" v-show="form.task.active">
                    <div class="main-column__form">
                        <div class="columns">
                            <div class="column">
                                Nome / Empresa
                                <input type="text" v-model="form.task.name" @input="sendSocket('task.name')" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form__side-column">
                    <div class="side-column__header">
                    </div>
                </div>
            </div>
            <div class="form__header">
                <span v-if="!form.task.active">Incluir uma <span style="color: var(--terciary-color)">tarefa</span> neste atendimento</span>
                <span class="push-both-sides"></span>
                <h3>TAREFA</h3> <app-switch style="float: right;" v-model="form.task.active" @changed="sendSocket('task.active')"></app-switch>
            </div>
        </form>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';

    export default {
        sockets: {
            presenceDraft(data){
                console.log("CHEGOU UM EVENTO NO PRESENCE", data);
            },
            draftSaved(){
                this.saving = false;
                console.log("DRAFT SALVO!");
            },
            updateDraft(data){
                _.mergeWith(this.form, data.form);
            }
        },
        data(){
            return {
                lastForm: null,
                form: {
                    client: {
                        active: false,
                        name: '',
                        legalDocument: ''
                    },
                    order: {
                        active: false,
                        name: ''
                    },
                    task: {
                        active: false,
                        name: ''
                    }
                },
                timeout: null,
                saving: false
            }
        },
        computed: {
            ...mapState('auth', ['user']),
            ...mapGetters('morph-screen', ['activeMorphScreen']),
        },
        methods: {
            getIsolatedFormPathObj(path){
                return _.set({}, path, _.get(this.form, path));
            },
            sendSocket(path){
                this.saving = true;
                const toBeEmitted = { draftId: 1, form: this.getIsolatedFormPathObj(path)};
                this.$socket.emit('update-draft', toBeEmitted);
            }
        },
        mounted(){
            const vm = this;
            this.$socket.emit('presence-update-draft', {
                draftId: vm.activeMorphScreen.draftId,
                userId: vm.user.id
            });
        }
    }
</script>

<style scoped>
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
        background-color: var(--bg-color-5-l);
        padding: 15px 20px;
        flex-grow: 1;
        margin-right: 10px;
        border-radius: 5px;
    }
    .form-group:last-child {
        margin-right: 0;
    }

    .form-columns {
        display: flex;
        flex-direction: row;
    }

    .form-column {
        display: flex;
        flex-direction: column;
    }

    div.ms-form {
        padding: 0 30px;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        flex-grow: 1;
        flex-shrink: 0;
        position: relative;
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
        margin: 30px 0 30px;
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
        background-color: var(--bg-color-7);
        flex-shrink: 0;
    }
    form .form__title {
        width: 100%;
        height: 40px;
    }
    div.ms-form form {
        display: flex;
        flex-direction: column;
        padding: 30px 0;
        flex-shrink: 0;
    }
    div.ms-form form.active {
        flex-grow: 1;
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
        font-size: 12px;
        margin-right: 15px;
        position: relative;
        top: 1px;
        font-weight: 600;
    }
    div.ms-form form .form__header > span {
        font-size: 14px;
    }
    div.ms-form form .form__header > span > span {
        font-size: 14px;
        font-weight: 600;
    }
    div.ms-form form .form__side-column {
        margin-left: 35px;
        width: 320px;
    }
</style>
