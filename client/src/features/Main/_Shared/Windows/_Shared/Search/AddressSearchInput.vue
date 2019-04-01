<template>
    <div>
        <input
                type="text"
                class="input"
                style="margin-bottom: 0; text-transform: uppercase"
                autocomplete="off"
                :value="value"
                :disabled="isEditing"
                :class="{ readonly: isEditing }"
                v-if="isEditing"
        />
        <app-popover
                ref="popover"
                :placement="'bottom-start'"
                :forceVisible="false"
                :useScroll="true"
                :contentPadding="false"
                :horizontalOffset="-15"
                :verticalOffset="3"
                v-else
        >
            <template slot="triggerer">
                <input
                        type="text"
                        class="input"
                        autocomplete="off"
                        style="margin-bottom: 0; text-transform: uppercase"
                        :value="value"
                        @click="isInputFocused = true"
                        @focus="focus()"
                        @blur="isInputFocused = false"
                        @input="input($event)"
                />
            </template>
            <template slot="content">
                <div class="result__container">
                    <div
                            v-for="item in items"
                            :key="item.id"
                            @click="select(item)"
                            class="result-item__container"
                    >
                        <span class="address" v-highlight="{keyword: searchValueStrings, sensitive: false}"> {{ item.name }} </span>
                        <span class="address-details">
              {{ item.neighborhood ? item.neighborhood : "SEM BAIRRO" }} -
              {{ item.city }}/{{ item.state }}
            </span>
                    </div>
                </div>
            </template>
        </app-popover>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters } from "vuex";
    import _ from "lodash";
    import shortid from 'shortid'

    export default {
        props: ["value", "address"],
        components: {},
        data() {
            return {
                isInputFocused: false,
                items: [],
                searchValueStrings: [],
            };
        },
        computed: {
            isEditing() {
                return Number.isInteger(this.address.id);
            }
        },
        methods: {
            focus() {
                this.isInputFocused = true;
                this.$refs.popover.update();
            },
            async input(ev) {
                const vm = this
                this.$emit("input", ev.target.value);
                this.searchValueStrings = _.filter(_.map(ev.target.value.split(" "), searchValue => searchValue.trim(), searchValue => searchValue !== ''))
                const documents = await new Promise((resolve, reject) => {
                    const taskId = `task/${shortid.generate()}`
                    vm.$searchWorker.postMessage({
                        taskId,
                        operation: 'search',
                        query: ev.target.value,
                        index: 'addresses',
                        options: {
                            fields: {
                                name: {
                                    boost: 1
                                }
                            },
                            limit: 30,
                            bool: "OR",
                            expand: false
                        }
                    })
                    vm.$searchWorker.onmessage = (event) => {
                        if(event.data.taskId === taskId){
                            resolve(event.data.documents)
                        }
                    }
                })
                this.$db.searchAddresses
                    .where("id")
                    .anyOf(
                        _.map(documents, resultDataItem => {
                            return parseInt(resultDataItem.ref);
                        })
                    )
                    .toArray()
                    .then(foundAddresses => {
                        this.items = _.map(documents, resultDataItem => {
                            return _.find(foundAddresses, {
                                id: parseInt(resultDataItem.ref)
                            })
                        })
                    })
            },
            select(address) {
                this.$refs.popover.closePopover();
                this.$emit("input", address.name);
                this.$emit("select", address);
            }
        },
        mounted() {}
    };
</script>

<style lang="scss">
    .result__container {
        .result-item__container {
            display: flex;
            flex-direction: column;
            width: 475px;
            padding: 12px 15px;
            border-bottom: 1px solid var(--border-color--0);
            cursor: pointer;
            &:last-child {
                border-bottom: 0;
            }
            &:hover {
                background-color: var(--bg-color--3);
            }
            .name {
                color: var(--font-color--primary);
                margin-bottom: 5px;
            }
        }
    }
</style>
