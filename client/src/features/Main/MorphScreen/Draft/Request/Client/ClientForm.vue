<template>
    <div style="display: flex; flex-grow: 1; flex-direction: row">
        <div class="form__main-column">
            <!-- client name and document -->
            <div class="form-groups">
                <div class="form-group">
                    <div class="form-columns">
                        <div class="form-column" style="flex-grow: 1;">
                            Nome / Empresa
                            <div v-if="id">
                                <input type="text" class="input--borderless" style="color: var(--font-color--primary)" v-model="name" @input="sync(name, 'name')" placeholder="..." />
                            </div>
                            <app-search v-else ref="search" :items="search.items" :shouldStayOpen="search.isNameInputFocused" :query="search.query" :verticalOffset="5" :horizontalOffset="-20"
                                @itemSelected="searchMethods().searchClientSelected($event)" >
                                <input type="text" class="input--borderless search-input__field" placeholder="..." v-model="name" @input="sync(name, 'name')" ref="searchInput"
                                @keydown="searchMethods().searchValueUpdated()" @focus="search.isNameInputFocused = true" @blur="search.isNameInputFocused = false" />
                                <template slot="item" slot-scope="props">
                                    <div class="search-input__item" v-if="props.item.client">
                                        <span class="detail__name" v-html="props.item.client.name"></span>
                                        <span class="detail__address" v-if="props.item.client.address" v-html="props.item.client.address.address + ', ' + props.item.client.address.number"></span>
                                        <span class="detail__phones" v-if="props.item.client.phones.length > 0">
                                        <span v-for="(clientPhone, index) in props.item.client.phones"
                                            v-html="((index === 0) ? '' : ', ') + clientPhone.number"></span>
                                        </span>
                                    </div>
                                    <div class="search-input__item" v-if="props.item.address">
                                        <span class="detail__address" v-html="props.item.address.name"></span>
                                    </div>
                                </template>
                                <template slot="no-results">
                                    <span>Nenhum resulado encontrado...</span>
                                </template>
                            </app-search>
                        </div>
                        <div class="form-column" style="justify-content: flex-end;">
                            <icon-search v-if="!id" style="position: relative; top: -4px;"></icon-search>
                            <div style="cursor: pointer;" @click="changeClient()" v-else>
                                <icon-change></icon-change>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    CPF / CNPJ
                    <app-mask class="input--borderless" ref="legalDocumentInput" :mask="['###.###.###-##', '##.###.###/####-##']" v-model="legalDocument"
                    placeholder="..." @input.native="inputLegalDocument($event)" />
                </div>
            </div>
            <div class="form-groups">
                <!-- Show client address form -->
                <app-client-addresses></app-client-addresses>
            </div>
        </div>
        <div class="form__side-column">
            <div class="form-groups">
                <app-client-phone-form></app-client-phone-form>
            </div>
            <div class="form-groups">
                <app-client-custom-field-form></app-client-custom-field-form>
            </div>
            <div class="form-groups">
                <app-client-group-form></app-client-group-form>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import { createHelpers } from 'vuex-map-fields'
    import _ from 'lodash'
    import utils from '@/utils'
    import DraftMixin from '../../DraftMixin'
    import ClientCustomFieldForm from './ClientCustomFieldsForm.vue'
    import ClientAddressForm from './ClientAddressForm.vue'
    import ClientPhoneForm from './ClientPhonesForm.vue'
    import ClientGroupForm from './ClientGroupForm.vue'
    import SearchComponent from '@/components/Inputs/Search.vue'
    import ClientAddressTypesInput from './ClientAddressTypesInput.vue'
    import ClientAddresses from './ClientAddresses.vue'
    import ServiceAPI from '@/api/service'
    import Vue from 'vue'

    const { mapFields } = createHelpers({
        getterType: 'draft/request/getField',
        mutationType: 'draft/request/updateField',
    })

    export default {
        components: {
            'app-search': SearchComponent,
            'app-client-address-form': ClientAddressForm,
            'app-client-address-types-input': ClientAddressTypesInput,
            'app-client-phone-form': ClientPhoneForm,
            'app-client-group-form': ClientGroupForm,
            'app-client-custom-field-form': ClientCustomFieldForm,
            'app-client-addresses': ClientAddresses
        },
        props: [],
        mixins: [DraftMixin],
        data(){
            return {
                search: {
                    items: [],
                    isNameInputFocused: false,
                    query: '',
                    lastQuery: '',
                    commitTimeout: null
                },
                customFields: [
                    {
                        companyId: 0,
                        dateCreated: null,
                        dateUpdated: null,
                        name: 'RG',
                        id: 1,
                        dateRemoved: null
                    },
                    {
                        companyId: 0,
                        dateCreated: null,
                        dateUpdated: null,
                        name: 'E-MAIL',
                        id: 2,
                        dateRemoved: null
                    },
                    {
                        companyId: 0,
                        dateCreated: null,
                        dateUpdated: null,
                        name: 'APELIDO',
                        id: 3,
                        dateRemoved: null
                    }
                ],
                clientGroups: [
                    {
                        text: 'NENHUM',
                        value: null
                    },
                    {
                        text: 'VAREJO DISK',
                        value: 'retail-disk'
                    },
                    {
                        text: 'VENDA AUTOMÁTICA',
                        value: 'automatic-sales'
                    },
                    {
                        text: 'COMÉRCIO',
                        value: 'commerce'
                    }
                ],
                formPath: 'request.client'
            }
        },
        watch: {
            'legalDocument': function(legalDocument){
                this.$refs.legalDocumentInput.display = legalDocument
            },
            'clientAddress.address.cep': function(cep){
                this.$refs.cepInput.display = cep
            },
            'clientPhoneForm.number': function(number){
                this.$refs.clientPhoneInput.display = number
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('auth', ['user','company']),
            ...mapFields([
                'form.client',
                'form.client.id',
                'form.client.name',
                'form.client.legalDocument',
            ])
        },
        methods: {

            ...mapActions('toast', ['showToast', 'showError']),
            ...mapActions('draft/request', ['setClient']),

            /**
             * Search
             */

            searchMethods(){
                const vm = this
                return {
                    search() {
                        ServiceAPI.search({
                            actingCities: ['MARINGA'],
                            q: vm.search.query,
                            companyId: vm.company.id
                        }).then(({data}) => {
                            let clients = data[0];
                            vm.search.items = clients.map(({source}) => {
                                // source refers to search address item
                                return {
                                    client: source
                                }
                            })
                            vm.$refs.search.search()
                        }).catch((err) => {
                            vm.search.items = []
                        })
                    },
                    searchClientSelected(searchItem) {
                        vm.search.items = []
                        const emitData = {
                            draftId: vm.activeMorphScreen.draft.draftId,
                            clientId: parseInt(searchItem.client.id)
                        }
                        console.log("Emitting draft/request.client.select", emitData)
                        vm.$socket.emit('draft/request.client.select', emitData)
                    },
                    searchValueUpdated() {
                        if (vm.search.commitTimeout) clearTimeout(vm.search.commitTimeout);
                        vm.search.commitTimeout = setTimeout(() => {
                            vm.search.query = vm.name;
                            vm.searchMethods().commitUpdatedValue()
                        }, 300)
                    },
                    commitUpdatedValue() {
                        if (vm.search.query.trim() !== vm.search.lastQuery) {
                            vm.search.lastQuery = vm.search.query.trim()
                            vm.searchMethods().search()
                        }
                    }
                }
            },

            /**
             * Inputs
             */

            inputLegalDocument(ev){
                if(ev.isTrusted){
                    this.sync(this.legalDocument, 'legalDocument')
                }
            },

            /**
             * Actions
             */

            changeClient(){
                this.setClient({})
                Vue.nextTick(() => {
                    this.syncMultiple(_.map(this.client, (v, k) => {
                        return {
                            value: v,
                            path: k
                        }
                    }))
                })
            }

        },
        created(){
            const vm = this

            /**
             * On client select
             * @param {Object} ev = { success:Boolean, evData = { } }
             */
            vm.$options.sockets['draft/request.client.select'] = (ev) => {
                console.log("Received draft/request.client.select", ev)
                if (ev.success) {
                    vm.setClient(ev.evData)
                    Vue.nextTick(() => {
                        vm.syncMultiple(_.map(vm.client, (v, k) => {
                            return {
                                value: v,
                                path: k
                            }
                        }))
                    })
                }
            }
        }
    }
</script>

<style scoped>

    /* search input */

    .search-input__field {
        border-bottom: 0;
    }
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
