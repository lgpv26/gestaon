<template>
    <div class="ms-form">
        <div class="form-columns">
            <div class="form-column" style="flex: 1 1 60%;">
                <label>Endereço</label>
                <div class="search">
                    <app-address-form :address.sync="clientAddress.address" @change="addressChanged($event)"></app-address-form>
                </div>
            </div>
            <div class="form-column" style="flex: 1 1 10%;">
                <label>Número</label>
                <input type="text" v-model="clientAddress.number" />
            </div>
            <div class="form-column" style="flex: 1 1 25%;">
                <label>Complemento</label>
                <input type="text" v-model="clientAddress.complement" />
            </div>
        </div>
        <div class="form-columns">
            <div class="form-column" style="flex: 1 1 40%;">
                <label>Bairro</label>
                <input type="text" v-model="clientAddress.address.neighborhood" />
            </div>
            <div class="form-column" style="flex: 1 1 15%;">
                <label>CEP</label>
                <!--<input type="text" v-model="form.address.cep" />-->
                <app-mask placeholder="#####-###" :mask="'#####-###'" v-model="clientAddress.address.cep" />
            </div>
            <div class="form-column" style="flex: 1 1 35%;">
                <label>Cidade</label>
                <input type="text" v-model="clientAddress.address.city" />
            </div>
            <div class="form-column" style="flex: 1 1 8%;">
                <label>Estado</label>
                <input type="text" v-model="clientAddress.address.state" />
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import AddressesAPI from '../../../../api/addresses';
    import ClientAPI from '../../../../api/clients';
    import AddressForm from './AddressForm.vue';

    export default {
        components: {
            'app-address-form': AddressForm
        },
        props: ['value','clientId','clientAddress'],
        data(){
            return {
            }
        },
        computed: {
        },
        methods: {
            ...mapActions('toast', 'showError'),
            addressChanged(ev){
                console.log(ev);
            },
            createClientAddress(){
                return {
                    addressId: null,
                    name: null,
                    number: null,
                    complement: null,
                    status: 'activated'
                }
            },
            save(){
                const vm = this;
                let clientAddress = this.createClientAddress();
                _.assign(clientAddress, _.pick(this.clientAddress, _.keys(clientAddress)));
                console.log(clientAddress);
                /*ClientAPI.saveAddresses(this.clientId, [clientAddress]).then((result)=>{
                    console.log(result)
                }).catch((err)=>{
                    vm.showError(err);
                });*/
            }
        },
        mounted(){

        }
    }
</script>

<style scoped>

    /* search input */

    .search {
        display: flex;
        flex-direction: row;
        position: relative;
    }

    .search .search-input__item {
        display: flex;
        flex-direction: column;
    }
    .search .search-input__item span {
        line-height: 150%;
        font-size: 13px;
    }
    .search .search-input__item span em {
        font-style: initial;
        color: red;
    }
    .search .search-input__settings {
        display: flex;
        align-items: center;
        flex-direction: row;
        padding-top: 15px;
        margin-top: 15px;
        border-top: 1px solid var(--bg-color--8);
    }
    .search .search-input__settings .settings__info {
        background-color: var(--bg-color--7);
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 20px;
        border: 1px solid var(--base-color--d);
    }

</style>