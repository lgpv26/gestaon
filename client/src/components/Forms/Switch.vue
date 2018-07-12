<template>
    <div class="form-component-switch" @click="toggle($event)">
        <div class="onoffswitch">
            <div ref="switch" :class="{ on: value }" class="onoffswitch-checkbox" id="myonoffswitch" />
            <label class="onoffswitch-label" :class="{ disabled: disabled }" for="myonoffswitch"></label>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            value: null,
            disabled: false
        },
        data(){
            return {
                on: false
            }
        },
        methods: {
            toggle(){
                if(!this.disabled) {
                    if (this.$refs.switch.classList.contains('on')) {
                        this.on = false;
                        this.$refs.switch.classList.remove("on");
                    }
                    else {
                        this.on = true;
                        this.$refs.switch.classList.add("on");
                    }
                    this.emit();
                }
            },
            emit(){
                this.$emit("input", this.on);
                this.$emit("changed", this.on);
                this.$emit("change", this.on);
            }
        }
    }
</script>

<style scoped>
    .onoffswitch {
        position: relative; width: 28px;
        -webkit-user-select:none; -moz-user-select:none; -ms-user-select: none;
    }
    .onoffswitch-checkbox {
        display: none;
    }
    .onoffswitch-label.disabled {
        cursor: not-allowed!important;
    }
    .onoffswitch-label {
        display: block; overflow: hidden; cursor: pointer;
        height: 18px; padding: 0; line-height: 18px;
        border: 1px solid #4A4A4A; border-radius: 18px;
        transition: background-color 0.3s ease-in;
        transition: all 0.3s ease-in 0s;
    }
    .onoffswitch-label:before {
        content: "";
        height: 14px;
        display: block;
        width: 14px;
        margin: 0px;
        background: #4A4A4A;
        position: absolute; top: 2px; bottom: 0;
        right: 12px;
        border-radius: 16px;
        transition: all 0.3s ease-in 0s;
    }
    .onoffswitch-checkbox.on + .onoffswitch-label:before {
        background-color: #61AFEF;
    }
    .onoffswitch-checkbox.on + .onoffswitch-label:before {
        right: 2px;
    }
    .onoffswitch-checkbox.on + .onoffswitch-label {
        border: 1px solid #61AFEF;
    }
    label {
        margin-bottom: 0;
    }
</style>
