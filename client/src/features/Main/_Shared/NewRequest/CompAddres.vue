<template>
<div>
    <new-comp-Addres-Text></new-comp-Addres-Text>
    
<div class="new-button_retrato">
<input type="button" value="novo endereço">
</div> 
</div>     
</template>

<script>
import CompAddresText from "./ComAddresText.vue"
export default {
components: {
    'new-comp-Addres-Text' : CompAddresText,
}
}
</script>

<style lang="scss">
.new-row{
    display: flex;
    flex-direction: row;
    align-content: center;
}
.new-retrato{
    width: 24px;
    height: 24px;
    padding: 5px 0px; 
    text-align: center;
    background: #31363C;
    border-radius: 2px;
}
.new-button_retrato{
    display: flex;
    flex-direction: row-reverse;
    margin: 20px 0px 0px 0px;
    input[type="button"]{
    background: #4D76C8;
    border-radius: 2px;
    font-family: Halton;
    font-size: 12px;
    line-height: 14px;
    color: #E7E8E8;
    border: 0px;
    height: 24px;
    width: 102px;
    cursor: pointer;
    }
}
</style>
