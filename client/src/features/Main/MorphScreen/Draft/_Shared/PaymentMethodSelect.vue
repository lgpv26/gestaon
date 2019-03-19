<template>
    <app-popover v-bind="popoverProps">
        <template slot="triggerer">
            <slot v-if="hasDefaultSlot"></slot>
            <input v-else type="text" style="cursor: pointer;" :value="selectedPaymentMethodName" readonly />
        </template>
        <template slot="content">
            <div style="width: 200px;">
                <h3>Meios de pagamento</h3>
                <div v-for="(paymentMethod, index) in paymentMethods" :key="index" class="item">
                    <div style="margin-top: 10px; position: relative;" v-if="editing === paymentMethod.id">
                        <input type="text" style="font-size: 12px;" v-model="editForm.name" />
                        <div style="position: absolute; right: 0px; top: 0; cursor: pointer;">
                            <icon-check></icon-check>
                        </div>
                    </div>
                    <div v-else :class="{ active: value.id === paymentMethod.id }" style="display: flex; flex-direction: row;">
                        <span style="cursor: pointer;" @click="select(paymentMethod)">{{ paymentMethod.name }}</span>
                        <span class="push-both-sides"></span>
                        <icon-check></icon-check>
                    </div>
                </div>
                <div style="margin-top: 20px; position: relative;" v-if="false">
                    <input type="text" style="font-size: 12px;" v-model="inputValue" placeholder="ADICIONAR NOVO" />
                    <div style="position: absolute; right: 0px; top: 0; cursor: pointer;" @click="save()">
                        <icon-check></icon-check>
                    </div>
                </div>
            </div>
        </template>
    </app-popover>
</template>

<script>
    import { mapState } from 'vuex'
    import _ from 'lodash'

    export default {
        props: ['value','popoverProps'],
        data(){
            return {
                editing: false,
                inputValue: null,
                editForm: {
                    name: null
                }
            }
        },
        computed: {
            ...mapState('data/payment-methods', ['paymentMethods']),
            hasDefaultSlot () {
                return !!this.$slots.default
            },
            selectedPaymentMethodName(){
                const selectedPaymentMethod = _.find(this.paymentMethods, {id: this.value.id})
                if(selectedPaymentMethod){
                    return selectedPaymentMethod.name
                }
                return '-- SELECIONAR --'
            }
        },
        methods: {
            select(paymentMethod){
                if(paymentMethod.id !== this.value.id){
                    this.$emit('change', paymentMethod)
                    this.$emit('input', paymentMethod)
                }
            },
            edit(paymentMethod){
                this.editing = paymentMethod.id
                this.editForm.name = paymentMethod.name
            },
            save(){

            }
        }
    }
</script>

<style scoped>
    h3 {
        font-size: 16px;
        text-transform: uppercase;
        color: var(--font-color--d-secondary);
        margin-bottom: 10px;
    }
    .item {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */
        margin-bottom: 10px;
    }
    .item:last-child {
        margin-bottom: 0;
    }
    .active >>> .colorizable {
        fill: var(--font-color--primary)
    }
</style>