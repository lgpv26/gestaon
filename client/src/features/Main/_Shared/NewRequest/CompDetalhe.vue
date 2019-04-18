<template>
<div>
    <div class="new-box">
        <span>{{ text }}</span>
        <div style="flex-grow:1;"></div>
        <select>
            <option>{{ option }}</option>
        </select>
    </div>
</div>
</template>

<script>
export default {
props:['text','option'],
}
</script>

<style lang="scss">
.new-box{
display: flex;
flex-direction: row; 
background: #23272B;
border-radius: 2px;
border: 1px solid #373C42;
padding-right: 10px;
span{
    margin: 9px 0px 0px 10px; 
    font-family: Halton;
    font-size: 14px;
}
}
.new-box select{     
background: transparent;
border: 0px;   
height: 32px;
color: #73777B;
-webkit-appearance: button;
outline: none;
font-family: Halton;
font-size: 18px;
line-height: 17px;
}
.new-box:after{   
margin: 9px 0px 0px 10px;    
content: url("./Elements/ic-down-baixo.png");
pointer-events: none;
border: 0px;
}
</style>
