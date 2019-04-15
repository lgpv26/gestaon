<template>
    <div class="new-row" style="align-items: center;margin:0px 0px 15px 0px;">
        <div style=" margin: 0px 10px 0px 0px;"><img src="./Elements/ic-checkmark.png"></div>
             <span>RUA SANTOS DUMONT, 1958 - EDIFÍCIO 14 BIS - BL B1 AP 1004</span>
             <div style="flex-grow: 1;"></div>
             <div class="new-retrato" style=" margin: 0px 5px 0px 5px;"><img src="./Elements/ic-location.png"></div>
             <div class="new-retrato" style=" margin: 0px 5px 0px 5px;"><img src="./Elements/ic-pen.png"></div>
             <div class="new-retrato" style=" margin: 0px 0px 0px 5px;"><img src="./Elements/ic-mini-trash.png"></div>
    </div>
</template>

<script>
export default {

}
</script>

<style lang="scss">
.new-retrato{
    width: 24px;
    height: 24px;
    padding: 5px 0px; 
    text-align: center;
    background: #31363C;
    border-radius: 2px;
}
.new-row{
    display: flex;
    flex-direction: row;
    align-content: center;
}
</style>
