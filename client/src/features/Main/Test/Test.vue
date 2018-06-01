<template>
    <div class="parent">
        <div class="form-area" style="display: flex; flex-shrink:0; flex-direction: row;" v-if="loading">
            Carregando...
        </div>
        <div class="form-area" style="display: flex; flex-shrink:0; flex-direction: row;" v-if="!loading">
            <div style="display: flex; flex-direction: column; flex-grow: 1; margin-right: 15px;">
                <label>Campo 1</label>
                <input type="text" @input="inputField1()" v-model="form.field1" />
            </div>
            <div style="display: flex; flex-direction: column; flex-grow: 1;">
                <label>Campo 2</label>
                <input type="text" @input="inputField2()" v-model="form.field2" />
            </div>
        </div>
        <div class="form-area" style="display: flex; flex-shrink:0; flex-direction: row;" v-if="!loading">
            <div style="display: flex; flex-direction: column; flex-grow: 1; margin-right: 15px;">
                <label>Textarea</label>
                <textarea ref="textarea" v-model="form.textarea"></textarea>
            </div>
        </div>
        <div class="form-area" style="display: flex; flex-shrink:0; flex-direction: row;" v-if="!loading">
            <div style="display: flex; flex-direction: column; flex-grow: 1; margin-right: 15px;">
                <label>Switch 1</label>
                <app-switch @change="toggleSwitch1($event)" v-model="form.switch1"></app-switch>
            </div>
            <div style="display: flex; flex-direction: column; flex-grow: 1; margin-right: 15px;">
                <label>Switch 2</label>
                <app-switch @change="toggleSwitch2($event)" v-model="form.switch2"></app-switch>
            </div>
            <div style="display: flex; flex-direction: column; flex-grow: 1; margin-right: 15px;">
                <label>Switch 3</label>
                <app-switch @change="toggleSwitch3($event)" v-model="form.switch3"></app-switch>
            </div>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';
    import Utils from '../../../utils';
    import UsersAPI from '../../../api/users';
    import _ from 'lodash';

    import config from '../../../config';

    import io from 'socket.io-client'
    import Vue from 'vue'

    export default {
        components: {
        },
        data(){
            return {
                loading: true,
                y: null,
                form: {
                    field1: '',
                    field2: '',
                    textarea: '',
                    switch1: false,
                    switch2: false,
                    switch3: false
                }
            }
        },
        methods: {
            /*inputTextarea(){
                if(this.y){
                    this.y.share.form.set('textarea', this.form.textarea)
                }
            },*/
            inputField1(){

            },
            inputField2(){

            },
            toggleSwitch1(value){

            },
            toggleSwitch2(value){

            },
            toggleSwitch3(value){

            }
        },
        created(){

        },
        mounted() {
        }
    }
</script>

<style scoped>
    div.parent {
        flex: 1;
        align-items: center;
    }
    tbody tr {
        cursor: pointer;
    }
    div.form-area {
        width: 80%;
        margin: 20px 0 0;
        padding: 20px;
        background-color: var(--bg-color--3)
    }
    label {
        margin-bottom: 5px;
    }
</style>