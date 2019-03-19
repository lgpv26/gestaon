<template>
    <div class="tracker-page">
        <div class="vertical-align">
            <div id="main-content-area" class="horizontal-align">
                <resize-observer @notify="mainContentContainerResized()" />
                <app-request-board></app-request-board>
            </div>
            <!--
            <app-bottom-panel :map.sync="map"></app-bottom-panel>
            -->
        </div>
    </div>
</template>

<script>
    import { mapMutations } from 'vuex'
    import RequestBoard from './RequestBoard/RequestBoard.vue'

    export default {
        name: 'app-dashboard',
        components: {
            'app-request-board': RequestBoard
        },
        methods: {
            ...mapMutations(['setMainContentArea']),
            mainContentContainerResized(){
                this.setMainContentArea({
                    height: document.getElementById('main-content-area').clientHeight,
                    width: document.getElementById('main-content-area').clientWidth
                })
            }
        },
        mounted(){
            this.mainContentContainerResized()
        }
    }
</script>

<style scoped>
    div.tracker-page {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        position: relative;
    }
    div.vertical-align {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
    div.horizontal-align {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        position: relative;
    }

    #markerLayer img {
        animation: pulse .5s infinite alternate;
        -webkit-animation: pulse .5s infinite alternate;
        transform-origin: center;
        -webkit-transform-origin: center;
    }
</style>
