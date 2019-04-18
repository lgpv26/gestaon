<template>
     <div>
               <div class="new-caixa-input" style="margin:20px 0px 10px 0px;">
                <input class="new-input-contato" style="flex-grow: 1;" type="text" value="Complemento adicional">
               <div style="margin:0px 20px 0px 20px;">
                <input type="checkbox">
               <span>Frente</span>
               </div>
               <div style="margin:0px 20px 0px 0px;">
                <input type="checkbox">
               <span>Fundo</span>
               </div><div style="margin:0px 20px 0px 0px;">
                <input type="checkbox">
               <span>A</span>
               </div><div style="margin:0px 20px 0px 0px;">
                <input type="checkbox">
               <span>B</span>
               </div><div style="margin:0px 0px 0px 0px;">
                <input type="checkbox">
               <span>C</span>
               </div>
               </div>
               <div class="new-caixa-input">
                   <input class="new-input-contato" style="width: 350px;margin:0px 10px 0px 0px;"  type="text" value="Nome do condomínio">
                    <input class="new-input-contato" style="width: 104px;margin:0px 10px 0px 0px;"  type="text" value="Bloco: Z99">
                     <input class="new-input-contato" style="width: 125px;" type="text" value="Nº Apto:  9999">
               </div>
           </div>
</template>

<script>
export default {

}
</script>

<style lang="scss">
.new-input-contato{
    border: 1px solid #373C42;
    border-radius: 5px;
    background: #23272B;
    color: #73777B;
    font-family: Halton;
    font-size: 17px;
    padding: 5px 10px 5px 10px; 
}
.new-caixa-input{
    display: flex;
    flex-direction:row;
    align-items: center;
}
</style>
