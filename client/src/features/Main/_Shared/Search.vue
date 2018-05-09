<template>
    <div class="app-search" :class="{'active': isSearchActive, 'has-chips': chips.length > 0}">
        <div class="search__search-chips" v-if="isSearchActive && chips.length > 0">
            <div class="search-chips__chip" v-for="(chip, index) in chips" tabindex="0" :key="index" ref="chipsEl" :class="{active: chip.isActive}"
            @focus="selectChip(chip)" @blur="unselectChip(chip)" @keydown="onSearchChipKeyDown($event)">
                {{ chip.text }}
            </div>
        </div>
        <div class="search__search-button"  @click="onSearchButtonClicked()">
            <icon-header-search></icon-header-search>
        </div>
        <div class="search__search-input">
            <app-search ref="search" :items="searchItems" :shouldStayOpen="isInputFocused" :forceNoResults="forceNoResults" :showOnly="showOnly" :query="query" :verticalOffset="19" :horizontalOffset="-20"
                @itemSelected="onItemSelect($event)">
                <input type="text" class="input--borderless search-input__field" v-model="inputValue" ref="searchInput" @focus="onSearchInputFocus()" @blur="onSearchInputBlur()"
                @keydown="onSearchInputKeyDown($event)" />
                <template slot="item" slot-scope="props">
                    <div class="search-input__item" v-if="props.item.client">
                        <span class="detail__name" v-html="props.item.client.name"></span>
                        <span class="detail__address" v-if="props.item.client.address" v-html="props.item.client.address.address + ', ' + props.item.client.address.number"></span>
                        <span class="detail__phones" v-if="props.item.client.phones.length > 0">
                            <span v-for="(clientPhone, index) in props.item.client.phones" v-html="((index === 0) ? '' : ', ') + clientPhone.ddd + clientPhone.number"></span>
                        </span>
                    </div>
                    <div class="search-input__item" v-if="props.item.address">
                        <span class="detail__address" v-html="props.item.address.name"></span>
                    </div>
                </template>
                <template slot="settings">
                    <div class="search-input__settings">
                        <app-switch v-model="showOnlyAddresses" @change="onShowOnlyAddressesChanged($event)" style="margin-right: 8px;"></app-switch>
                        <span style="margin-right: 8px;">Apenas endereços</span>
                        <a class="settings__info">?</a>
                    </div>
                </template>
                <template slot="no-results">
                    <span>Nenhum resulado encontrado...</span>
                </template>
            </app-search>
        </div>
        <div class="search__action-button" ref="actionButton" >
            <app-dropdown-menu :menuList="menuList" placement="bottom-start" :verticalOffset="15">
                <div style="width: 40px; height: 20px; display: flex; align-items: center; justify-content: center;">
                    <icon-header-add></icon-header-add>
                </div>
            </app-dropdown-menu>
        </div>
    </div>
</template>

<script>
    import DraftsAPI from '../../../api/drafts';
    import ServiceAPI from '../../../api/service';
    import SearchComponent from '../../../components/Inputs/Search.vue';
    import DropdownMenuComponent from "@/components/Utilities/DropdownMenu.vue";
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';
    import markjs from 'mark.js';

    export default {
        components: {
            'app-search': SearchComponent,
            "app-dropdown-menu": DropdownMenuComponent
        },
        data(){
            return {
                query: '',
                lastSearchObj: {},
                inputValue: '',
                chips: [],
                isInputFocused: false,
                isSearchActive: false,
                commitTimeout: null,
                markJs: null,
                searchItems: [],
                forceNoResults: false,
                showOnlyAddresses: false,
                menuList: [
                    {text: 'Atendimento', type: 'system', action: this.addRequestDraft},
                    {text: 'Plano de contas', type: 'system', action: this.addAccountsDraft},
                    {text: 'Compra/Despesa', type: 'system', action: this.addExpenseDraft}
                ]
            }
        },
        computed: {
            ...mapState('auth', ['user','company']),
            ...mapState('morph-screen', { isShowingMorphScreen: 'isShowing' }),
            ...mapState('morph-screen', ['searchData']),
            showOnly(){
                if(this.showOnlyAddresses === true){
                    return 'address';
                }
                return null;
            },
            searchObject(){
                return {
                    inputValue: this.inputValue,
                    chips: this.chips
                }
            }
        },
        methods: {
            ...mapActions('morph-screen', ['createDraft']),
            ...mapMutations('morph-screen', ['ADD_DRAFT','SET_MS', 'SHOW_MS', 'SET_SEARCH_DATA']),
            ...mapActions('toast', ['showError']),
            cleanSearchData(){
                console.log("Reset search data")
                this.SET_SEARCH_DATA(null)
            },
            onItemSelect(item){
                if(_.has(item, 'client')){
                    this.SET_SEARCH_DATA({
                        text: this.inputValue,
                        client: item.client
                    })
                }
                else if(_.has(item, 'address')){
                    this.SET_SEARCH_DATA({
                        text: this.inputValue,
                        address: item.address
                    })
                }
            },
            onShowOnlyAddressesChanged(){
                if(this.showOnlyAddresses){
                    this.search();
                }
                else {
                    this.forceNoResults = false;
                }
            },
            addAccountsDraft(){
                const vm = this;
                if(!vm.isShowingMorphScreen){
                    const createDraftArgs = { body: {type: 'accounts'}, companyId: vm.company.id };
                    vm.createDraft(createDraftArgs)
                } else {
                    this.SHOW_MS(false);
                }
            },
            addRequestDraft(){
                const vm = this;
                if(!vm.isShowingMorphScreen){
                    const createDraftArgs = { body: {
                        type: 'request',
                        createdBy: vm.user.id
                    }, companyId: vm.company.id };
                    vm.createDraft(createDraftArgs)
                } else {
                    this.SHOW_MS(false)
                }
            },
            addExpenseDraft(){
                const vm = this;
                if(!vm.isShowingMorphScreen){
                    const createDraftArgs = { body: {type: 'expense'}, companyId: vm.company.id };
                    vm.createDraft(createDraftArgs)
                } else {
                    this.SHOW_MS(false);
                }
            },
            search(){
                const vm = this;
                const searchComponent = vm.$refs.search;
                ServiceAPI.search({
                    actingCities: ['MARINGA'],
                    q: vm.query,
                    companyId: vm.company.id
                }).then(({data}) => {
                    let clients = data[0];
                    let addresses = data[1];
                    vm.searchItems = [];
                    clients = clients.map(({source}) => {
                        // source refers to search address item
                        return {
                            client: source
                        };
                    });
                    addresses = addresses.map(({source}) => {
                        // source refers to search address item
                        return {
                            address: source
                        };
                    });
                    if(vm.showOnly === 'address' && addresses.length <= 0){
                        vm.forceNoResults = true;
                    }
                    else {
                        vm.forceNoResults = false;
                    }
                    vm.searchItems = _.concat(clients, addresses);
                    searchComponent.search();

                }).catch((err) => {
                    vm.searchItems = [];
                })
            },
            searchValueCommited(searchObj){
                let query = '';
                if(searchObj.chips.length > 0){
                    const chips = searchObj.chips.map(chip => chip.text);
                    query += chips.join(" ");
                }
                if(searchObj.inputValue.trim()){
                    query += " " + searchObj.inputValue;
                }
                this.query = query;
                this.search();
            },
            commitUpdatedValue(){
                const vm = this;
                if(JSON.stringify(vm.searchObject) !== JSON.stringify(vm.lastSearchObj)){
                    vm.lastSearchObj = vm.searchObject;
                    vm.searchValueCommited(vm.searchObject);
                }
            },
            searchValueUpdated(ignoreTimeout = false){
                const vm = this;
                if(vm.commitTimeout) clearTimeout(vm.commitTimeout);
                if(ignoreTimeout){
                    vm.searchValueCommited(vm.searchObject);
                }
                else{
                    vm.commitTimeout = setTimeout(() => {
                        vm.commitUpdatedValue();
                    }, 300)
                }
            },
            selectPrev(){
                const activeChip = _.find(this.chips, { isActive: true });
                if(activeChip){
                    const index = this.chips.indexOf(activeChip);
                    this.unselectChip(activeChip);
                    if((index - 1) < 0){
                        this.focusInput();
                    }
                    else {
                        this.selectChip(_.nth(this.chips, index - 1));
                    }
                }
                else {

                    this.selectChip(_.last(this.chips));
                }
            },
            selectNext(){
                const activeChip = _.find(this.chips, { isActive: true });
                if(activeChip){
                    const index = this.chips.indexOf(activeChip);
                    this.unselectChip(activeChip);
                    if(index + 1 > this.chips.length - 1){
                        this.focusInput();
                    }
                    else {
                        this.selectChip(_.nth(this.chips, index + 1));
                    }
                }
                else {
                    this.selectChip(_.first(this.chips));
                }
            },
            selectChip(chip){
                this.$refs.chipsEl[this.chips.indexOf(chip)].focus();
                chip.isActive = true;
            },
            unselectChip(chip){
                this.$refs.chipsEl[this.chips.indexOf(chip)].blur();
                chip.isActive = false;
            },
            addChip(){
                const inputValue = this.inputValue.trim();
                if(inputValue) {
                    this.chips.push({
                        text: inputValue,
                        isActive: false
                    });
                    this.inputValue = '';
                    this.searchValueUpdated(true);
                }
            },
            removeChipAndSelectPrev(chip = null){
                if(!chip){
                    const activeChip = _.find(this.chips, { isActive: true });
                    if(activeChip){
                        this.selectPrev();
                        this.chips.splice(this.chips.indexOf(activeChip), 1);
                        this.searchValueUpdated(true);
                    }
                    return true;
                }
                this.selectPrev();
                this.chips.splice(this.chips.indexOf(chip), 1);
                this.searchValueUpdated(true);
            },
            removeChipAndSelectNext(chip = null){
                if(!chip){
                    const activeChip = _.find(this.chips, { isActive: true });
                    if(activeChip){
                        this.selectNext();
                        this.chips.splice(this.chips.indexOf(activeChip), 1);
                        this.searchValueUpdated(true);
                    }
                    return true;
                }
                this.selectNext();
                this.chips.splice(this.chips.indexOf(chip), 1);
                this.searchValueUpdated(true);
            },
            onSearchChipKeyDown(ev){
                if(ev.code === 'ArrowLeft'){
                    this.selectPrev();
                }
                else if(ev.code === 'ArrowRight'){
                    this.selectNext();
                }
                else if(ev.code === 'Backspace'){
                    this.removeChipAndSelectPrev();
                }
                else if(ev.code === 'Delete'){
                    this.removeChipAndSelectNext();
                }
                else if(ev.code === "Escape"){
                    ev.preventDefault();
                    this.hideSearch();
                }
            },
            onSearchInputKeyDown(ev){
                if(ev.key === "Enter"){
                    this.addChip();
                }
                else if(ev.code === "Tab"){
                    ev.preventDefault();
                    this.selectNext();
                }
                else if(ev.code === "Escape"){
                    ev.preventDefault();
                    this.hideSearch();
                }
                else{
                    this.searchValueUpdated();
                }
                if(ev.target.selectionStart === 0){
                    if(ev.code === "ArrowLeft"){
                        this.selectPrev();
                    }
                    else if(ev.code === "ArrowRight"){
                        this.selectNext();
                    }
                }
            },
            onSearchInputFocus(){
                this.focusInput();
                this.isInputFocused = true;
            },
            onSearchInputBlur(){
                this.isInputFocused = false;
            },
            onSearchButtonClicked(){
                this.toggleSearch();
                if(this.isSearchActive){
                    this.onSearchInputFocus();
                }
                else {
                    this.onSearchInputBlur();
                }
            },
            blurInput(){
                this.$refs.searchInput.focus();
            },
            focusInput(){
                this.$refs.searchInput.focus();
            },
            hideSearch(){
                this.blurInput();
                this.isSearchActive = false;
            },
            showSearch(){
                this.isSearchActive = true;
            },
            toggleSearch(){
                this.isSearchActive = !this.isSearchActive;
            }
        },
        created(){
            const vm = this
            /**
             * On active step change
             * @param {Object} ev = { success:Boolean, evData:Draft }
             */
            vm.$options.sockets['draft.create'] = (ev) => {
                if (ev.success) {
                    vm.ADD_DRAFT(ev.evData)
                    setImmediate(() => {
                        if (ev.evData.createdBy === vm.user.id) {
                            vm.SET_SEARCH_DATA({
                                text: vm.inputValue
                            })
                            vm.SET_MS({
                                draftId: ev.evData.draftId,
                                screen: {
                                    active: true
                                }
                            })
                            vm.SHOW_MS(true)
                        }
                    })
                }
                console.log("Received draft.create", ev)
            }
        }
    }
</script>

<style scoped>

    div.app-search {
        height: 32px;
        align-self: center;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    /* search chips */

    div.app-search > .search__search-chips {
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-color--7);
        border-bottom-left-radius: 32px;
        border-top-left-radius: 32px;
        padding-left: 20px;
    }
    div.app-search > .search__search-chips .search-chips__chip {
        padding: 3px 12px 2px;
        border-radius: 20px;
        background-color: var(--secondary-color--d);
        font-size: 10px;
        text-transform: uppercase;
        color: var(--base-color--l);
        margin-right: 5px;
        font-weight: 600;
        outline: 0;
        cursor: pointer;
    }
    div.app-search > .search__search-chips .search-chips__chip.active {
        background-color: var(--secondary-color);
    }
    div.app-search > .search__search-chips .search-chips__chip:last-child {
        margin-right: 0;
    }

    /* search input */

    div.app-search.active .search__search-input {
        width: 320px;
        padding-right: 20px;
    }
    .search__search-input {
        height: 32px;
        width: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-color--9);
        transition: .2s all;
    }
    .search__search-input .search-input__field {
        border-bottom: 0;
    }
    .search__search-input .search-input__item {
        display: flex;
        flex-direction: column;
    }
    .search__search-input .search-input__item span {
        line-height: 150%;
        font-size: 13px;
    }
    .search__search-input .search-input__item span em {
        font-style: initial;
        color: red;
    }
    .search__search-input .search-input__settings {
        display: flex;
        align-items: center;
        flex-direction: row;
        padding-top: 15px;
        margin-top: 15px;
        border-top: 1px solid var(--bg-color--8);
    }
    .search__search-input .search-input__settings .settings__info {
        background-color: var(--bg-color--7);
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 20px;
        border: 1px solid var(--base-color--d);
    }

    /* search button */

    div.app-search > .search__search-button {
        width: 50px;
        height: 32px;
        display: flex;
        padding-left: 3px;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-color--9);
        border-bottom-left-radius: 32px;
        border-top-left-radius: 32px;
        cursor: pointer;
    }
    div.app-search.active.has-chips > .search__search-button {
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
    }
    div.app-search > .search__dropdown-menu {
        padding: 0 20px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--primary-color);
        cursor: pointer;
    }
    div.app-search > .search__dropdown-menu span {
        color: var(--base-color--l);
        font-size: 12px;
        font-weight: 600;
    }
    div.app-search > .search__separator {
        width: 1px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--primary-color);
    }
    div.app-search > .search__separator > .separator--line {
        height: 20px;
        border-left: 1px solid rgba(255,255,255,.2);
    }
    div.app-search > .search__action-button {
        padding-right: 2px;
        width: 50px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--primary-color);
        border-bottom-right-radius: 32px;
        border-top-right-radius: 32px;
        cursor: pointer;
    }

</style>
