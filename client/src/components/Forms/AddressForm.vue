<template>
    <app-search ref="search" :items="searchAddresses" :shouldStayOpen="isInputFocused" :query="query">
        <input type="text" class="search-input__field" v-model="inputValue" ref="searchInput" @focus="onSearchInputFocus()" @blur="onSearchInputBlur()"
               @keydown="onSearchInputKeyDown($event)" />
        <template slot="item" slot-scope="props">
            <div class="search-input__item">
                <span class="detail__name">TRÁ TRÁ ---</span>
                <span class="detail__address" v-html="props.item.text">RUA 28 DE JUNHO, 1214</span>
                <span class="detail__phones">(44) 3268-6768, (44) 99107-8686</span>
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
    import SearchComponent from '../Inputs/Search.vue';

    export default {
        components: {
            'app-search': SearchComponent
        },
        props: ['value'],
        data(){
            return {
                searchAddresses: [],
                query: ''
            }
        },
        computed: {
        },
        methods: {

        },
        mounted(){
        }
    }
</script>

<style scoped>
</style>