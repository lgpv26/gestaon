<template>
    <div class="ms-form">
        <div class="ms-form__spinner" v-if="saving">
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
        <form :style="{'flex-grow': form.client.active}">
            <div class="main-column__header">
                <span v-if="!form.client.active">Incluir um <span style="color: var(--primary-color)">cliente</span> neste atendimento</span>
                <span class="push-both-sides"></span>
                <h3>DADOS DO CLIENTE</h3> <app-switch style="float: right;" v-model="form.client.active" @changed="sendSocket('client.active')"></app-switch>
            </div>
            <div class="form__content">
                <div class="form__main-column">
                    <div class="main-column__form" v-show="form.client.active">
                        <div class="columns">
                            <div class="column">
                                Nome / Empresa
                                <input type="text" v-model="form.client.name" @input="sendSocket('client.name')" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form__side-column">
                    <div class="side-column__header">
                    </div>
                </div>
            </div>
        </form>
        <div class="separator"></div>
        <form :style="{'flex-grow': form.order.active}">
            <div class="main-column__header">
                <span v-if="!form.order.active">Incluir uma <span style="color: var(--secondary-color)">venda</span> neste atendimento</span>
                <span class="push-both-sides"></span>
                <h3>VENDA</h3> <app-switch style="float: right;" v-model="form.order.active" @changed="sendSocket('order.active')"></app-switch>
            </div>
            <div class="form__content">
                <div class="form__main-column">
                    <div class="main-column__form" v-show="form.order.active">
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
        </form>
        <div class="separator"></div>
        <form :style="{'flex-grow': form.client.active}">
            <div class="main-column__header">
                <span v-if="!form.task.active">Incluir uma <span style="color: var(--terciary-color)">tarefa</span> neste atendimento</span>
                <span class="push-both-sides"></span>
                <h3>TAREFA</h3> <app-switch style="float: right;" v-model="form.task.active" @changed="sendSocket('task.active')"></app-switch>
            </div>
            <div class="form__content">
                <div class="form__main-column">
                    <div class="main-column__form" v-show="form.task.active">
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
        </form>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';

    export default {
        sockets: {
            draftSaved(){
                this.saving = false;
                console.log("DRAFT SALVO!");
            },
            updateDraft(data){
                _.mergeWith(this.form, data.form);
            }
        },
        watch: {
        },
        data(){
            return {
                lastForm: null,
                form: {
                    client: {
                        active: false,
                        name: ''
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
        }
    }
</script>

<style scoped>
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
    div.ms-form form .form__main-column {
        flex-grow: 1;
    }
    div.ms-form form .main-column__header {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 24px;
    }
    div.ms-form form .main-column__header h3 {
        font-size: 12px;
        margin-right: 15px;
        position: relative;
        top: 1px;
        font-weight: 600;
    }
    div.ms-form form .main-column__header > span {
        font-size: 14px;
    }
    div.ms-form form .main-column__header > span > span {
        font-size: 14px;
        font-weight: 600;
    }
    div.ms-form form .main-column__form {
        margin-top: 35px;
    }
    div.ms-form form .form__side-column {
        width: 320px;
    }
</style>
