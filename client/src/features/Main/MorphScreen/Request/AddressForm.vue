<template>
    <app-search ref="search" @itemSelected="addressSearchItemSelected($event)" :items="addresses" :shouldStayOpen="isAddressInputFocused" :query="addressQuery"
                :verticalOffset="8" :horizontalOffset="-20">
        <input type="text" class="search-input__field" v-model="address.name" ref="searchInput"
        @focus="isAddressInputFocused = true" @blur="isAddressInputFocused = false" @keydown="onAddressSearchInputKeyDown($event)" />
        <template slot="item" slot-scope="props">
            <div class="search-input__item">
                <span class="detail__address" v-html="props.item.text">RUA 28 DE JUNHO, 1214</span>
            </div>
        </template>
        <template slot="settings">
            <div class="search-input__settings">
                <app-switch style="margin-right: 8px;"></app-switch>
                <span style="margin-right: 8px;">Apenas endereços</span>
                <a class="settings__info">?</a>
            </div>
        </template>
        <template slot="no-results">
            <span>Nenhum resulado encontrado...</span>
        </template>
    </app-search>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import AddressesAPI from '../../../../api/addresses';
    import SearchComponent from '../../../../components/Inputs/Search.vue';

    export default {
        components: {
            'app-search': SearchComponent
        },
        props: ['address'],
        data(){
            return {
                addressQuery: null,
                addressInputTimeout: null,
                isAddressInputFocused: false,
                addresses: []
            }
        },
        methods: {
            searchAddresses(){
                const vm = this;
                const searchComponent = vm.$refs.search;
                AddressesAPI.search({
                    actingCities: ['MARINGA'],
                    q: vm.addressQuery
                }).then((result) => {
                    vm.addresses = result.data.map(({source}) => {
                        return {
                            addressId: source.id,
                            text: source.name
                        };
                    });
                    searchComponent.search();
                }).catch((err) => {
                    vm.addresses = [];
                });
            },
            onAddressSearchInputKeyDown(ev){
                if(this.addressInputTimeout) clearTimeout(this.addressInputTimeout);
                this.addressInputTimeout = setTimeout(() => {
                    this.addressQuery = this.address.name;
                    this.searchAddresses();
                }, 300);
            },
            addressSearchItemSelected(item){
                const vm = this;
                AddressesAPI.getOne(item.addressId).then(({data}) => {
                    _.assign(vm.address, _.pick(data, _.keys(vm.address)));
                    vm.$emit('change', vm.address);
                    /*console.log(data);*/
                });
            }
        },
        mounted(){
        }
    }
</script>

<style scoped>

    /* search input */

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