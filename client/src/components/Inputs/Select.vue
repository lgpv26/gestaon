<template>
    <app-popover v-bind="popoverProps" :useScroll="true" :disabled="disabled">
        <template slot="triggerer">
            <slot></slot>
        </template>
        <template slot="content">
            <div class="select-input__container" style="width: 240px;">
                <div
                        class="container__section"
                        v-show="sections && sections.length > 0"
                        v-for="(section, index) in sections"
                        :key="index"
                >
                    <slot name="section" :text="section.text"></slot>
                    <div
                            class="section__item"
                            v-for="(item, index) in section.items"
                            :key="index"
                    >
                        <slot name="item" :text="item.text"></slot>
                        <span class="push-both-sides"></span> OK
                    </div>
                </div>
                <div class="container__items" v-show="items && items.length > 0">
                    <div
                            class="items__item"
                            v-for="(item, index) in items"
                            :key="index"
                            @click="itemSelected(item)"
                    >
                        <slot
                                name="item"
                                :text="item.text"
                                :active="
                (!multiple && item.value === value) ||
                  (multiple && value.length && value[value.indexOf(item.value)])
              "
                        ></slot>
                        <span class="push-both-sides"></span>
                        <span
                                v-if="
                (!multiple && item.value === value) ||
                  (multiple && value.length && value[value.indexOf(item.value)])
              "
                        >
              <icon-check></icon-check>
            </span>
                    </div>
                </div>
            </div>
        </template>
    </app-popover>
</template>
<script>
    import Vue from "vue";
    import _ from "lodash";
    import Popper from "popper.js";
    export default {
        data() {
            return {
                popperInstance: null,
                closeTimeout: null,
                isShowing: false,
                inputValue: null
            };
        },
        props: [
            "value",
            "sections",
            "items",
            "title",
            "verticalOffset",
            "horizontalOffset",
            "multiple",
            "popoverProps",
            'disabled'
        ],
        computed: {},
        methods: {
            onMouseOver() {
                if (this.closeTimeout) {
                    clearTimeout(this.closeTimeout);
                }
            },
            onMouseLeave() {
                this.closeTimeout = setTimeout(() => {
                    this.closeSelect();
                }, 1200);
            },
            onClickTarget() {
                this.openSelect();
            },
            onClick(ev) {
                const vm = this;
                if (
                    vm.isShowing &&
                    vm.$refs.container &&
                    ((vm.$refs.container !== ev.target &&
                        !vm.$refs.container.contains(ev.target)) ||
                        ev.target === vm.$refs.closeButton ||
                        vm.$refs.closeButton.contains(ev.target))
                ) {
                    vm.closeSelect();
                }
            },
            openSelect() {
                this.isShowing = true;
                /*document.addEventListener("click", this.onClick);*/
                Vue.nextTick(() => {
                    if (this.popperInstance) {
                        this.popperInstance.destroy();
                    }
                    this.popperInstance = new Popper(
                        this.$refs.target,
                        this.$refs.container,
                        {
                            placement: "bottom-start",
                            modifiers: {
                                flip: {
                                    enabled: false
                                }
                            }
                        }
                    );
                });
            },
            closeSelect() {
                this.isShowing = false;
            },
            toggleSelect() {
                if (this.isShowing) return this.closeSelect();
                this.openSelect();
            },
            itemSelected(item) {
                if (!this.multiple) {
                    // single select
                    if (this.value === item.value) {
                        this.onValueChanged(null);
                        this.$emit("unselect", item.value);
                    } else {
                        this.onValueChanged(item.value);
                        this.$emit("select", item.value);
                    }
                } else {
                    // multiple select
                    if (_.includes(this.value, item.value)) {
                        this.onValueChanged(this.value);
                        this.$emit("unselect", item.value);
                    } else {
                        this.onValueChanged(this.value);
                        this.$emit("select", item.value);
                    }
                }
                this.closeSelect();
            },
            saveInput() {
                this.$emit("save", this.inputValue);
            },
            onValueChanged(value) {
                this.$emit("input", value);
                this.$emit("change", value);
            }
        }
    };
</script>

<style>
    .select-input__container {
    }
    .container__close-button {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 15px;
        height: 15px;
        padding: 0;
        display: flex;
        font-size: 10px;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        line-height: 100%;
        background-color: var(--bg-color--7);
        color: var(--font-color);
    }
    .container__section {
        margin-bottom: 10px;
    }
    .container__section:last-child {
        margin-bottom: 0;
    }
    .section__item,
    .container__items .items__item {
        display: flex;
        flex-direction: row;
        cursor: pointer;
        padding: 8px 0;
        height: 32px;
    }
    .ag-select-input .section__item span {
        color: var(--base-color);
    }
    .ag-select-input .container__items {
        display: flex;
        flex-direction: column;
    }
    .select-input__container h3 {
        color: var(--secondary-color--d);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
    }
    .container__items .items__item span {
        color: var(--base-color);
    }
    .container__items .items__item >>> .colorizable {
        fill: var(--font-color--secondary);
    }
    .container__input {
        margin-top: 10px;
        position: relative;
    }
    .container__input input {
        font-size: 12px;
    }
</style>
