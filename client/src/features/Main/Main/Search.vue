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
            <input type="text" v-model="inputValue" ref="searchInput" @focus="onSearchInputFocus()" @blur="onSearchInputBlur()"
            @keydown="onSearchInputKeyDown($event)" />
            <div class="search-input__result-box" v-if="isSearchActive">
                <div class="result-box__items">
                    <div class="items__item--client">
                        <div class="item--client__detail">
                            <span class="detail__name">THIAGO YOITHI VAZ DA ROCHA</span>
                            <span class="detail__address">RUA 28 DE JUNHO, 1214</span>
                            <span class="detail__phones">(44) 3268-6768, (44) 99107-8686</span>
                        </div>
                        <div class="item--client__actions"></div>
                    </div>
                    <div class="items__item--address">
                        <div class="item--address__name"></div>
                    </div>
                </div>
                <div class="result-box__settings">
                    <app-switch style="margin-right: 8px;"></app-switch>
                    <span style="margin-right: 8px;">Apenas endereços</span>
                    <a class="settings__info">?</a>
                </div>
            </div>
        </div>
        <div class="search__dropdown-menu">
            <span>NOVO ATENDIMENTO</span>
        </div>
        <div class="search__separator">
            <div class="separator--line"></div>
        </div>
        <div class="search__action-button" ref="actionButton" @click="addRequestClicked($event)">
            <icon-header-add></icon-header-add>
        </div>
    </div>
</template>

<script>
    import DraftsAPI from '../../../api/drafts';
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import _ from 'lodash';

    export default {
        components: {
        },
        data(){
            return {
                lastSearchObj: {},
                inputValue: '',
                chips: [],
                isInputFocused: false,
                isSearchActive: false,
                commitTimeout: null
            }
        },
        computed: {
            ...mapState('auth', ['company']),
            ...mapState('morph-screen', { isShowingMorphScreen: 'isShowing' }),
            searchObject(){
                return {
                    inputValue: this.inputValue,
                    chips: this.chips
                }
            }
        },
        methods: {
            ...mapActions('morph-screen', ['createDraft']),
            ...mapMutations('morph-screen', ['SHOW_MS', 'SET_MS_SCREEN']),
            addRequestClicked(ev){
                const vm = this;
                if(!vm.isShowingMorphScreen){
                    const createDraftArgs = { body: {type: 'request'}, companyId: vm.companyId };
                    vm.createDraft(createDraftArgs).then((response) => {
                        vm.SET_MS_SCREEN({
                            active: true,
                            draft: response.data
                        });
                        vm.SHOW_MS(true);
                    });
                } else {
                    this.SHOW_MS(false);
                }
            },
            searchValueCommited(searchObj){
                console.log(searchObj);
            },
            searchValueUpdated(){
                const vm = this;
                if(vm.commitTimeout) clearTimeout(vm.commitTimeout);
                vm.commitTimeout = setTimeout(() => {
                    if(JSON.stringify(vm.searchObject) !== JSON.stringify(vm.lastSearchObj)){
                        vm.lastSearchObj = vm.searchObject;
                        vm.searchValueCommited(vm.searchObject);
                    }
                }, 500)
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
                }
            },
            removeChipAndSelectPrev(chip = null){
                if(!chip){
                    const activeChip = _.find(this.chips, { isActive: true });
                    if(activeChip){
                        this.selectPrev();
                        this.chips.splice(this.chips.indexOf(activeChip), 1);
                        this.searchValueUpdated();
                    }
                    return true;
                }
                this.selectPrev();
                this.chips.splice(this.chips.indexOf(chip), 1);
                this.searchValueUpdated();
            },
            removeChipAndSelectNext(chip = null){
                if(!chip){
                    const activeChip = _.find(this.chips, { isActive: true });
                    if(activeChip){
                        this.selectNext();
                        this.chips.splice(this.chips.indexOf(activeChip), 1);
                    }
                    return true;
                }
                this.selectNext();
                this.chips.splice(this.chips.indexOf(chip), 1);
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
                /*this.isInputFocused = false; this.hideSearch(); */
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
        margin-right: 10px;
        position: relative;
    }
    div.app-search > .search__search-chips {
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-color-7);
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
    div.app-search > .search__search-input {
        height: 32px;
        width: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }
    div.app-search > .search__search-input .search-input__result-box {
        display: flex;
        flex-direction: column;
        width: 420px;
        background: var(--bg-color-5);
        z-index: 999999;
        top: 47px;
        position: absolute;
        left: 0;
        border-radius: 10px;
        padding: 20px 20px;
    }
    .search-input__result-box .result-box__items {
        display: flex;
        flex-direction: column;
        padding-bottom: 20px;
        margin-bottom: 20px;
        border-bottom: 1px solid rgba(255,255,255,.1);
    }
    .search-input__result-box .result-box__items .items__item--client {
        display: flex;
        flex-direction: row;
    }
    .search-input__result-box .result-box__items .items__item--client .item--client__detail {
        display: flex;
        flex-direction: column;
    }
    .search-input__result-box .result-box__items .items__item--client .item--client__detail span {
        line-height: 120%;
    }
    .search-input__result-box .result-box__settings {
        display: flex;
        align-items: center;
        flex-direction: row;
    }
    .search-input__result-box .result-box__settings .settings__info {
        background-color: var(--bg-color-7);
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 20px;
        border: 1px solid var(--base-color--d);
    }
    div.app-search > .search__search-button {
        width: 50px;
        height: 32px;
        display: flex;
        padding-left: 3px;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-color-7);
        border-bottom-left-radius: 32px;
        border-top-left-radius: 32px;
        cursor: pointer;
    }
    div.app-search.active.has-chips > .search__search-button {
        border-bottom-left-radius: 0px;
        border-top-left-radius: 0px;
    }
    div.app-search > .search__search-input {
        height: 32px;
        width: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-color-7);
        transition: .2s all;
    }
    div.app-search.active > .search__search-input {
        width: 320px;
        padding-right: 20px;
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
        position: relative;
        top: 1px;
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
