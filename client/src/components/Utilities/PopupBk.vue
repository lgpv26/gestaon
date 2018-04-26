<template>
    <div class="full-fill">
        <div :id="id" class="popup-content">
            <slot name="content">
            </slot>
        </div>
        <div v-tippy="config" class="popup-triggerer">
            <slot name="triggerer">
            </slot>
        </div>
    </div>
</template>

<script>

    import _ from 'lodash'
    import VueTippy from 'vue-tippy'

    export default {
        props: {
        },
        data(){
            return {
                id: null,
                config: {
                    trigger: 'click',
                    hideOnClick: false,
                    placement: 'bottom-start',
                    theme: 'erp-dark',
                    interactive: true,
                    reactive : true,
                    duration: 100,
                    inertia: true,
                    arrow: true,
                    zIndex: 9999999,
                    animation: 'perspective'
                }
            }
        },
        methods: {
        },
        created(){
            this.id = _.uniqueId('popup-')
            this.config.html = '#' + this.id
        }
    }
</script>

<style>
    .full-fill {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .popup-content label {
        color: var(--font-color)
    }
</style>
