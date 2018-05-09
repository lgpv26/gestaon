<template>
    <div class="form-group">
        <div style="cursor: pointer; display: flex; flex-direction: row; align-items: center;">
            <div class="header__icon" style="margin-right: 8px;">
                <icon-phone style="position: relative; top: 2px;"></icon-phone>
            </div>
            <span class="static">Telefones</span>
            <span class="push-both-sides"></span>
            <a href="javascript:void(0)" @click="add()">
                <icon-add class="header__action-icon"></icon-add>
            </a>
        </div>
        <div class="form-group__content" v-if="_.isArray(clientPhoneRows) && clientPhoneRows.length > 0">
            <div class="dashed-line"></div>
            <ul class="content__list--mini">
                <li class="list__item" v-for="(clientPhoneRow, index) in clientPhoneRows">
                    <div class="item__check item__icon" @click="select(clientPhoneRow)" style="cursor: pointer; margin-right: 8px;">
                        <icon-check style="width: 16px;"></icon-check>
                    </div>
                    <input type="text" placeholder="APELIDO" v-model="clientPhoneRow.name" @input="sync(clientPhoneRow.name, 'clientPhones[' + index + '].name')" class="input--borderless" />
                    <div class="item__mini-circle"></div>
                    <app-mask :mask="['(##) ####-####','(##) #####-####']" ref="clientPhoneInput" v-model="clientPhoneRow.number"
                              @input.native="inputClientPhoneRowNumber($event, index)" placeholder="(##) #####-####" class="input--borderless"></app-mask>
                    <span class="push-both-sides"></span>
                    <a href="javascript:void(0)" @click="remove(clientPhoneRow.id, index)">
                        <icon-remove style="flex-shrink: 0;"></icon-remove>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'
    import _ from 'lodash'
    import utils from '@/utils/index'
    import shortid from 'shortid'

    import DraftMixin from '../../DraftMixin'

    const { mapFields, mapMultiRowFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        props: [],
        mixins: [DraftMixin],
        data(){
            return {
                items: [],
                formPath: 'request.client'
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company']),
            ...mapMultiRowFields({
                clientPhoneRows: 'form.client.clientPhones'
            }),
            ...mapFields(['form.client.clientPhones']),
        },
        methods: {
            ...mapActions('toast', ['showToast', 'showError']),
            ...mapActions('draft/request', ['addClientPhone','removeClientPhone']),
            inputClientPhoneRowNumber(ev, index){
                if(ev.isTrusted){
                    this.sync(this.clientPhones[index].number, 'clientPhones[' + index + '].number')
                }
            },
            remove(clientPhoneId, index){
                this.removeClientPhone(clientPhoneId)
                this.syncKeyRemove(index, 'clientPhones')
            },
            add(){
                this.addClientPhone({
                    name: '',
                    number: ''
                })
                this.sync(this.clientPhones,'clientPhones')
            },
            select(clientPhone){
                console.log("Select", clientPhone)
            }
        }
    }
</script>

<style scoped>

    .mini-circle {
        flex-shrink: 0;
        height: 4px;
        width: 4px;
        background-color: var(--font-color--secondary);
        border-radius: 2px;
        margin: 0 10px;
    }

    .form-group__content {
        margin-top: 15px;
    }

    .form-group__content .dashed-line {
        height: 2px;
        background-image: linear-gradient(to right, var(--border-color--2) 50%, rgba(255,255,255,0) 0%);
        background-position: bottom left;
        background-size: 6px 2px;
        background-repeat: repeat-x;
        margin-bottom: 15px;
    }

</style>
