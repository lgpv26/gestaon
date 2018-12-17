<template>
    <div class="checkbox__container">
        <div class="checkbox">
            <div class=""> <!-- or checked -->
                <label>
                    <span></span>
                </label>
            </div>
        </div>
    </div>
</template>

<script>

    import Vue from 'vue'

    export default {
        props: ['value'],
        data(){
            return {

            }
        },
        methods: {
        }
    }
</script>

<style scoped lang="scss">
    $font-color: var(--font-color);
    $primary-color: var(--font-color--primary);
    $selected-font-color: #FFF;

    .checkbox__container {
        display: table; // to center the item
        width: 100%;
        height: 100%;

        .checkbox {
            display: table-cell; // to center the item
            width: 100%;
            height: 100%;
            vertical-align: middle; // to center the item
            text-align: center; // to center the item
        }
    }

    label {
        display: inline-block; // to make it easier to click
        color: #fff;
        cursor: pointer;
        position: relative; // important

        // Now we'll create the checkbox object

        span {
            display: inline-block;
            position: relative;
            background-color: transparent;
            width: 18px;
            height: 18px;
            transform-origin: center;
            border: 2px solid $font-color;
            border-radius: 50%;
            vertical-align: -4px;
            margin-right: 10px;
            transition: background-color 150ms 200ms, transform 350ms cubic-bezier(.78,-1.22,.17,1.89); // custom ease effect for bouncy animation

            // Now we'll create the "tick" using pseudo elements - those will be basically two lines that will be rotated to form the "tick"

            &:before {
                content: "";
                width: 0px;
                height: 2px;
                border-radius: 2px; // so that the tick has nice rounded look
                background: $font-color;
                position: absolute;
                transform: rotate(45deg);
                top: 6px;
                left: 3px;
                transition: width 50ms ease 50ms;
                transform-origin: 0% 0%;
            }

            &:after {
                content: "";
                width: 0;
                height: 2px;
                border-radius: 2px; // so that the tick has nice rounded look
                background: $font-color;
                position: absolute;
                transform: rotate(305deg);
                top: 11px;
                left: 5px;
                transition: width 50ms ease;
                transform-origin: 0% 0%;
            }
        }
        // Time to add some life to it

        &:hover {
            span {
                border: 2px solid $primary-color;

                &:before {
                    width: 5px;
                    transition: width 100ms ease;
                    background: $selected-font-color;
                }

                &:after {
                    width: 10px;
                    transition: width 150ms ease 100ms;
                    background: $selected-font-color;
                }
            }
        }
    }

    .checkbox {

        // Let's add some effects after the checkbox is checked

        .checked {
            label {
                span {
                    border: 2px solid $primary-color;
                    background-color: $primary-color;
                    transform: scale(1.25); // enlarge the box

                    &:after {
                        width: 10px;
                        background: $selected-font-color;
                        transition: width 150ms ease 100ms; // enlarge the tick
                    }

                    &:before {
                        width: 5px;
                        background: $selected-font-color;
                        transition: width 150ms ease 100ms; // enlarge the tick
                    }
                }

                &:hover { // copy the states for onMouseOver to avoid flickering
                    span {
                        background-color: $primary-color;
                        transform: scale(1.25); // enlarge the box

                        &:after {
                            width: 10px;
                            background: $selected-font-color;
                            transition: width 150ms ease 100ms; // enlarge the tick
                        }

                        &:before {
                            width: 5px;
                            background: $selected-font-color;
                            transition: width 150ms ease 100ms; // enlarge the tick
                        }
                    }
                }
            }
        }
    }
</style>
