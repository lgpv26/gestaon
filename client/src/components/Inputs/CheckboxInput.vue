<template>
    <div class="ag-checkbox-input" @click="toggle($event)">
        <div class="check-container">
        </div>
    </div>
</template>

<script>

    export default {
        props: ['value'],
        data(){
            return {
                on: false
            }
        },
        methods: {
            toggle(ev){
                if(this.$refs.switch.classList.contains('on')){
                    this.on = false;
                    this.$refs.switch.classList.remove("on");
                }
                else{
                    this.on = true;
                    this.$refs.switch.classList.add("on");
                }
                this.emit();
            },
            emit(){
                this.$emit("input", this.on);
                this.$emit("changed", this.on);
            }
        }
    }
</script>

<style scoped>
    .ag-checkbox-input .check-container {
        width: 18px;
        height: 18px;
        background: transparent;
        border: 1px solid #aaa;
        border-radius: 3px;
    }
</style>
