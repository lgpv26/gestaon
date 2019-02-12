<template>
    <app-new-search :popoverProps="{placement: 'bottom-start', forceVisible: searchInputIsFocused}" :items="items">
        <slot></slot> {{searchInputIsFocused}}
        <template slot="item" slot-scope="props">
            <div class="result-item__container">
                <span class="name">{{ props.item.name }}</span>
                <span class="address">
                    <app-text-highlight :queries="['RUA']" :highlightClass="'highlight'">
                        {{(props.item.address) ? props.item.address : 'S/ENDEREÇO' }}, {{(props.item.number) ? props.item.number : 'S/NÚMERO' }}
                        {{(props.item.complement) ? ' ' + props.item.complement : '' }}
                    </app-text-highlight>
                </span>
                <span class="address-details">
                    {{(props.item.neighborhood) ? props.item.neighborhood : 'S/BAIRRO' }}, {{(props.item.city) ? props.item.city : 'S/CIDADE' }} - {{(props.item.state) ? props.item.state : 'S/ESTADO' }}
                </span>
            </div>
        </template>
    </app-new-search>
</template>

<script>
    import _ from 'lodash'
    import NewSearchComponent from '../../../../../../components/Inputs/NewSearch.vue'

    export default {
        props: ['value','searchInputIsFocused'],
        components: {
            'app-new-search': NewSearchComponent
        },
        data(){
            return {
                timeoutBetweenInput: null,
                searchVal: null,
                items: []
            }
        },
        watch: {
            value: {
                handler(val){
                    if(this.timeoutBetweenInput){
                        clearTimeout(this.timeoutBetweenInput)
                    }
                    this.timeoutBetweenInput = setTimeout(() => {
                        this.search(val)
                    }, 200)
                },
                immediate: true
            }
        },
        methods: {
            search(str){
                console.log("Executou search")
                if(this.$static.searchClientsIndex){
                    let resultData = this.$static.searchClientsIndex.search(str,{
                        fields: {
                            name: {boost: 1},
                            address: {boost: 1},
                            number: {boost: 1},
                            complement: {boost: 1}
                        },
                        bool: "OR",
                        expand: false
                    }).slice(0,30)
                    this.$db.searchClients.where('id').anyOf(_.map(resultData,(resultDataItem) => {
                        return resultDataItem.ref
                    })).toArray().then((foundClients) => {
                        this.items = _.map(resultData, (resultDataItem) => {
                            return _.find(foundClients,{id: resultDataItem.ref})
                        })
                    })
                }
            }
        },
        beforeDestroy(){
            if(this.timeoutBetweenInput){
                clearTimeout(this.timeoutBetweenInput)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .result-item__container {
        display: flex;
        flex-direction: column;
        .name {
            color: var(--font-color--primary);
            margin-bottom: 5px;
        }
    }

</style>
