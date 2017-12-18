<template>
    <div class="product-input">
        <app-search ref="search" :items="searchItems" :shouldStayOpen="isInputFocused" :query="query" :verticalOffset="5" :horizontalOffset="-20"
                    @itemSelected="onSearchProductSelect($event)" >
            <input type="text" class="search-input__field" placeholder="ENCONTRAR" v-model="searchValue" ref="searchInput"
                   @keydown="onSearchValueUpdate()" @focus="isInputFocused = true" @blur="isInputFocused = false" />
            <template slot="item" slot-scope="props">
                <div class="search-input__item">
                    <span class="detail__name">{{ props.item.product }}</span>
                    <span class="detail__supplier">{{ props.item.supplierName }}</span>
                </div>
            </template>
            <template slot="no-results">
                <span>Nenhum resulado encontrado...</span>
            </template>
        </app-search>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import { Select } from "@/components/Inputs/Select/index";
    import _ from 'lodash';
    import utils from '@/utils/index';
    import ProductsAPI from '@/api/products';
    import SearchComponent from '@/components/Inputs/Search.vue';

    export default {
        components: {
            'app-search': SearchComponent
        },
        props: ['value'],
        data(){
            return {
                isInputFocused: false,
                searchItems: [],
                lastQuery: '',
                query: '',
                searchValue: ''
            }
        },
        computed: {
            ...mapState('auth', ['user','company'])
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),

            /**
             * Product search
             */

            search(){
                const vm = this;
                ProductsAPI.search({
                    actingCities: ['MARINGA'],
                    q: vm.query,
                    companyId: vm.company.id
                }).then(({data}) => {
                    vm.searchItems = data;
                    vm.$refs.search.search();
                    console.log(vm.searchItems);
                }).catch((err) => {
                    vm.searchItems = [];
                });
            },
            onSearchProductSelect(searchItem){
                const vm = this;

                const toBeEmitted = { draftId: this.activeMorphScreen.draft.draftId, clientId: searchItem.client.id};
                /*this.$socket.emit('draft:client-select', toBeEmitted);*/
                vm.searchItems = [];
            },
            onSearchValueUpdate(){
                if(this.commitTimeout) clearTimeout(this.commitTimeout);
                this.commitTimeout = setTimeout(() => {
                    this.query = this.searchValue;
                    this.commitUpdatedValue();
                }, 300)
            },
            commitUpdatedValue(){
                if(this.query.trim() !== this.lastQuery){
                    this.lastQuery = this.query.trim();
                    this.search();
                }
            },

        }
    }
</script>

<style scoped>

    /* search input */

    .search-input__item {
        display: flex;
        flex-direction: column;
    }
    .search-input__item span {
        line-height: 150%;
        font-size: 13px;
    }
    .search-input__item span em {
        font-style: initial;
        color: red;
    }
    .search-input__settings {
        display: flex;
        align-items: center;
        flex-direction: row;
        padding-top: 15px;
        margin-top: 15px;
        border-top: 1px solid var(--bg-color--8);
    }
    .search-input__settings .settings__info {
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