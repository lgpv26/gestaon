<template>
    <div class="new-request__menu__button">
            <div class="new-menu__head">
            <span class="new-head__text">{{ tab.titulo }}</span> 
            <span style="flex-grow: 1"></span>
            <img  :src="img" >
            </div>
            <span class="new-menu__text">{{ tab.text1 }} <br> {{ tab.text2 }}</span>
        </div>
</template>

<script>

export default {
props:['tab','icons','img'],
}
</script>

<style lang="scss" scoped>
    .new-request__menu__button{
            display: flex;
            flex-direction: column;    
            background: #23272B;
            height: 70px;
            border: 0.5px solid #161A1D;
            padding: 2px 4px 0px 10px;
            flex-grow: 1;
            }
            .new-request__menu__button:hover{
            background: linear-gradient(89.54deg, #0072E4 -0.59%, #25A0A8 100.95%);    
            .new-menu__text{
            color: white;
            }
            .new-head__text{
            color: white;   
            }
            }
            .new-menu__head{
            display: flex;
            flex-direction: row;  
            }
            .new-menu__text{
            font-family: Halton;
            font-size: 12px;
            color: #73777B;
            }
            .new-head__text{
            font-family: Halton;
            font-size: 18px;
            color: #73777B;   
            }
</style>
