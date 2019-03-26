<template>
    <div class="tracker-controls" v-if="false" :class="{dark: this.customMapTheme}">
        <ul>
            <li @click="toggleCustomMapTheme()" v-tippy="{ position: 'left', theme: 'light', inertia: true, arrow: true, animation: 'perspective' }" :title="'Inverter cores do mapa'" :class="{dark: this.customMapTheme}"><i class="mi mi-invert-colors"></i></li>
        </ul>
    </div>
</template>
<script>
    import { mapState, mapActions } from 'vuex';

    import moment from 'moment';
    import Vue from 'vue';

    export default {
        props: ['map'],
        data(){
            return {
                customMapTheme: true
            }
        },
        computed: {
            ...mapState('tracker', ['selected'])
        },
        methods: {
            ...mapActions('tracker', ['followDevice']),
            toggleCustomMapTheme(){
                this.customMapTheme = !this.customMapTheme;
                console.log(this.customMapTheme);
                if(this.customMapTheme) this.map.setMapTypeId('dark');
                else this.map.setMapTypeId('light');
            }
        }
    }
</script>

<style scoped>
    div.tracker-controls {
        border-radius: 30px;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
        background: rgba(0,0,0,.1);
    }
    div.tracker-controls.dark {
        background: rgba(255,255,255,.1);
    }
    div.tracker-controls ul {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
    div.tracker-controls ul li{
        list-style: none;
        cursor: pointer;
        color: var(--font-color--10);
        font-size: 20px;
        padding: 0 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        top: -1px;
        transition: .3s all;
    }
    div.tracker-controls ul li:hover {
    }
</style>
