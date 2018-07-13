<template>
    <transition>
    <div class="parent" v-if="loading">
        <div class="loading-container">
            <div class="cssload-loader">
                <div class="cssload-inner cssload-one"></div>
                <div class="cssload-inner cssload-two"></div>
                <div class="cssload-inner cssload-three"></div>
            </div>
            <h3 v-if="loadingText">{{ loadingText }}</h3>
        </div>
    </div>
    </transition>
</template>
<script>
    export default {
        props: {
            loading: {
                type: Boolean,
                default: false
            },
            loadingText: {
                type: String,
                default: "Aguarde..."
            }
        }
    }
</script>

<style scoped>

    .v-enter-active {
      transition: all .2s ease-in;
    }
    .v-leave-active {
      transition: all .2s ease-in;
    }
    .v-enter, .v-leave-to {
      filter: blur(5px);
      opacity: 0;
    }

    .parent {
        background: rgba(38,39,46,0.9);
        z-index: 99999;
        width: 100%;
        height: 100%;
        position: absolute;
        display: flex;
        justify-content: center;
    }

    h3 {
        color: #FFF;
        text-align: center;
        font-size: 14px;
    }

    .loading-container {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .cssload-loader {
        margin-right: 8px;
        position: relative;
        left: 0;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        -o-border-radius: 50%;
        -ms-border-radius: 50%;
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        perspective: 780px;
    }

    .cssload-inner {
        position: absolute;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        -o-box-sizing: border-box;
        -ms-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        border-radius: 50%;
        -o-border-radius: 50%;
        -ms-border-radius: 50%;
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
    }

    .cssload-inner.cssload-one {
        left: 0%;
        top: 0%;
        animation: cssload-rotate-one 1.15s linear infinite;
        -o-animation: cssload-rotate-one 1.15s linear infinite;
        -ms-animation: cssload-rotate-one 1.15s linear infinite;
        -webkit-animation: cssload-rotate-one 1.15s linear infinite;
        -moz-animation: cssload-rotate-one 1.15s linear infinite;
        border-bottom: 3px solid rgb(255,255,255);
    }

    .cssload-inner.cssload-two {
        right: 0%;
        top: 0%;
        animation: cssload-rotate-two 1.15s linear infinite;
        -o-animation: cssload-rotate-two 1.15s linear infinite;
        -ms-animation: cssload-rotate-two 1.15s linear infinite;
        -webkit-animation: cssload-rotate-two 1.15s linear infinite;
        -moz-animation: cssload-rotate-two 1.15s linear infinite;
        border-right: 3px solid rgb(255,255,255);
    }

    .cssload-inner.cssload-three {
        right: 0%;
        bottom: 0%;
        animation: cssload-rotate-three 1.15s linear infinite;
        -o-animation: cssload-rotate-three 1.15s linear infinite;
        -ms-animation: cssload-rotate-three 1.15s linear infinite;
        -webkit-animation: cssload-rotate-three 1.15s linear infinite;
        -moz-animation: cssload-rotate-three 1.15s linear infinite;
        border-top: 3px solid rgb(255,255,255);
    }

    @keyframes cssload-rotate-one {
        0% {
            transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
        }
        100% {
            transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
        }
    }

    @-o-keyframes cssload-rotate-one {
        0% {
            -o-transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
        }
        100% {
            -o-transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
        }
    }

    @-ms-keyframes cssload-rotate-one {
        0% {
            -ms-transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
        }
        100% {
            -ms-transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
        }
    }

    @-webkit-keyframes cssload-rotate-one {
        0% {
            -webkit-transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
        }
        100% {
            -webkit-transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
        }
    }

    @-moz-keyframes cssload-rotate-one {
        0% {
            -moz-transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
        }
        100% {
            -moz-transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
        }
    }

    @keyframes cssload-rotate-two {
        0% {
            transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
        }
        100% {
            transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
        }
    }

    @-o-keyframes cssload-rotate-two {
        0% {
            -o-transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
        }
        100% {
            -o-transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
        }
    }

    @-ms-keyframes cssload-rotate-two {
        0% {
            -ms-transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
        }
        100% {
            -ms-transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
        }
    }

    @-webkit-keyframes cssload-rotate-two {
        0% {
            -webkit-transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
        }
        100% {
            -webkit-transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
        }
    }

    @-moz-keyframes cssload-rotate-two {
        0% {
            -moz-transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
        }
        100% {
            -moz-transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
        }
    }

    @keyframes cssload-rotate-three {
        0% {
            transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
        }
        100% {
            transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
        }
    }

    @-o-keyframes cssload-rotate-three {
        0% {
            -o-transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
        }
        100% {
            -o-transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
        }
    }

    @-ms-keyframes cssload-rotate-three {
        0% {
            -ms-transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
        }
        100% {
            -ms-transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
        }
    }

    @-webkit-keyframes cssload-rotate-three {
        0% {
            -webkit-transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
        }
        100% {
            -webkit-transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
        }
    }

    @-moz-keyframes cssload-rotate-three {
        0% {
            -moz-transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
        }
        100% {
            -moz-transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
        }
    }
</style>
