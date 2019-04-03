<template>
<div class="new-request__caixa">
    <span class="new-request__span">{{ text }}</span>
</div>
</template>

<script>
import CompButtonIT from './CompButtonIT.vue'
export default {
props:['text'],
components: {
        'new-button-it' : CompButtonIT,
        
    },
}
</script>

<style>
.new-request__caixa{
    display: flex;
    flex-direction: row;
    background: #23272B;
    border: 2px;
    border-radius: 2px;
    height: 63px;
    padding: 12px;
}
</style>
