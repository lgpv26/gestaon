<template>
    <div class="new-row">
            <div class="new-column">
            <span>Rua, Avenida, Praça...</span> 
            <div class="new-inputs" style="width:398px;">
            <input type="text" value="Buscar cadastrados ou criar novo">
            <div style=" flex-grow: 1;margin:0px;"></div>
            <div>
                <img src="./Elements/ic-search.png">
            </div>
            </div>   
            </div>

            <div class="new-column numero">
               <span>Nº <span style="color: tomato;">*</span></span>
               <div class="new-inputs">
            <input type="text">
            </div>   
            </div>
            <div class="new-column">
               <div class="button-img">
                   <div>
                       <img src="./Elements/ic-address-details.png">
                   </div>
                   <span>Complemento</span>
               </div>
            </div>
            </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" >
.new-column{
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}
.new-row{
    display: flex;
    flex-direction: row;
    align-content: center;
}
.numero{
    display: flex;
    margin: 0px 10px;
    max-width: 50px ;
    flex-shrink: 0;
    input[type="text"]{
    font-family: Halton;
    font-size: 18px;
    color: #E7E8E8;
    background: transparent;
    border: 0px;
    max-width: 40px;
    margin: 0px 5px;
    }
}
.new-inputs{
    border-bottom: 2px solid #373C42;
    padding-bottom: 6px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 1px;
    input[type="text"]{
    font-family: Halton;
    font-size: 18px;
    color: #E7E8E8;
    background: transparent;
    border: 0px;
    width: 323px;
    }
}
.button-img{
    max-width: 132px;
    padding: 7px 10px 5px 10px;
    margin-top: 20px;
    display: flex;
    height: 32px;
    background: #31363C;
    border-radius: 5px;
    cursor: pointer;
    img{
        margin-right: 5px;
    } 
}
</style>
