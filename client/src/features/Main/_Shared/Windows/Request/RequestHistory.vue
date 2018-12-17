<template>
    <div class="request__history" v-if="show">
        <a href="javascript:void(0)" class="back" @click="$emit('close',true)"><i class="mi mi-undo"></i></a>
        <div class="timeline">
            <div class="entry">
                <div class="title">
                    <h3>26/04/1994</h3>
                    <p>Title, Company</p>
                </div>
                <div class="body">
                    <p>Voluptatibus veniam ea reprehenderit atque reiciendis non laborum adipisci ipsa pariatur omnis.</p>
                    <ul>
                        <li>Rerum sit libero possimus amet excepturi</li>
                        <li>Exercitationem enim dolores sunt praesentium dolorum praesentium</li>
                        <li>Modi aut dolores dignissimos sequi sit ut aliquid molestias deserunt illo</li>
                    </ul>
                </div>
            </div>
            <div class="entry">
                <div class="title">
                    <h3>28/04/1994</h3>
                    <p>Title, Company</p>
                </div>
                <div class="body">
                    <p>Voluptatibus veniam ea reprehenderit atque reiciendis non laborum adipisci ipsa pariatur omnis.</p>
                    <ul>
                        <li>Rerum sit libero possimus amet excepturi</li>
                        <li>Exercitationem enim dolores sunt praesentium dolorum praesentium</li>
                        <li>Modi aut dolores dignissimos sequi sit ut aliquid molestias deserunt illo</li>
                    </ul>
                </div>
            </div>
            <div class="entry">
                <div class="title">
                    <h3>2009 - 2010</h3>
                    <p>Title, Company</p>
                </div>
                <div class="body">
                    <p>Voluptatibus veniam ea reprehenderit atque reiciendis non laborum adipisci ipsa pariatur omnis.</p>
                    <ul>
                        <li>Rerum sit libero possimus amet excepturi</li>
                        <li>Exercitationem enim dolores sunt praesentium dolorum praesentium</li>
                        <li>Modi aut dolores dignissimos sequi sit ut aliquid molestias deserunt illo</li>
                    </ul>
                </div>
            </div>
            <div class="entry">
                <div class="title">
                    <h3>2006 - 2008</h3>
                    <p>Title, Company</p>
                </div>
                <div class="body">
                    <p>Voluptatibus veniam ea reprehenderit atque reiciendis non laborum adipisci ipsa pariatur omnis.</p>
                    <ul>
                        <li>Rerum sit libero possimus amet excepturi</li>
                        <li>Exercitationem enim dolores sunt praesentium dolorum praesentium</li>
                        <li>Modi aut dolores dignissimos sequi sit ut aliquid molestias deserunt illo</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex'
    import _ from 'lodash'
    import Vue from 'vue'
    import shortid from 'shortid'

    export default {
        props: ['request','show'],
        components: {
        },
        data(){
            return {
            }
        },
        computed: {
        },
        methods: {
        },
        created(){
        },
        mounted(){
        }
    }
</script>

<style lang="scss" scoped>
    .request__history {
        $gutter: 30px;
        $border-width: 3px;
        $dot-diameter: 18px;
        position: absolute;
        overflow-y: auto;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 99;
        background-color: var(--bg-color--2);
        a.back {
            position: absolute;
            right: 20px;
            top: 20px;
            i {
                font-size: 48px;
            }
        }
        .timeline {
            width:100%;
            max-width:800px;
            padding: 100px 50px;
            position: relative;
            &:before {
                content: '';
                position: absolute;
                top: 0px;
                left:calc(33% + 15px); //$gutter/2
                bottom: 0px;
                width: $border-width;
                background: #ddd;
            }
            &:after {
                content: "";
                display: table;
                clear: both;
            }
        }

        .entry {
            clear: both;
            text-align: left;
            position: relative;
            .title {
                margin-bottom: .5em;
                float: left;
                width: 33%;
                padding-right: $gutter;
                text-align: right;
                position: relative;
                &:before {
                    content: '';
                    position: absolute;
                    width: $dot-diameter;
                    height: $dot-diameter;
                    border: $border-width solid salmon;
                    background-color:#fff;
                    border-radius:100%;
                    top: 12px;
                    right: -$dot-diameter + ($dot-diameter / 2);
                    z-index: 99;
                }
                h3 {
                    margin: 0;
                    font-size: 120%;
                }
                p {
                    margin: 0;
                    font-size: 100%;
                }
            }
            .body {
                margin: 0 0 3em;
                float: right;
                width: 66%;
                padding-left: $gutter;
                padding-top: 2px;
                p {
                    line-height: 1.4em;
                    &:first-child {
                        margin-top: 0;
                        font-weight: 400;
                    }
                }
                ul {
                    color:#aaa;
                    padding-left: 0;
                    list-style-type: none;
                    li:before {
                        content: "–";
                        margin-right: .5em;
                    }
                }
            }
        }

    }
</style>
