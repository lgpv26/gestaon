<template>
<div class="new-request__body">
    <div class="new-row new-body">
        <div class="new-column new-contato">
        <div>
            <span class="text-span">Contato / Cliente <span style="color: tomato;">*</span></span>
        </div>
        <div style="margin-top: 1px;">
            <span class="text-grand-span">NOME / EMPRESA</span>
        </div>
        </div>

         <div class="new-column new-telefone">
        <div>
            <span class="text-span">Telefone</span>
        </div>
        <div class="new-row" style="margin-top: 1px;">
            <span class="text-grand-span">(99) 99999-9999</span>
            <div>
            <img style="margin: 2px 8px;" src="./Elements/ic-checkmark.png" >
            <img style="cursor: pointer;" src="./Elements/bt-expand.png" >
            </div>
        </div>
        </div>
    </div>
     <div class="new-row new-body__endereço"> 
        <div class="endereço">
            <span>Endereços</span>
        </div>  
        <div class="detalhes">
            <span>Detalhes do contato</span>
        </div>
        </div>

        <div class="new-form">
            <!-- parte 1 -->
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
            <!-- parte 2 -->
            <div  class="new-row">
               
            </div>
        </div>
        
        
</div>
</template>

<script>
export default {

}
</script>

<style lang="scss" >
.new-request__body {
display: flex;
flex-direction: column;
flex-grow: 1;
padding: 20px 20px 0px 20px ;
background: #161A1D; 
}
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
.new-contato{
    background: #23272B;
    border-radius: 2px;
    margin: 0px 5px 0px 0px;
    padding: 10px;
    height: 53px;
    .text-span{
    font-family: Halton;
    font-size: 14px;
    line-height: 17px;
    color: #73777B;
    }
    .text-grand-span{
    font-family: Halton;
    font-size: 18px;
    line-height: 17px;
    color: white;
    }
}
.new-telefone{
    background: #23272B;
    border-radius: 2px;
    margin: 0px 0px 0px 5px;
    padding: 10px;
    height: 53px;
    max-width: 210px;
    flex-shrink: 0;
    .text-span{
    font-family: Halton;
    font-size: 18px;
    line-height: 17px;
    color: #73777B;    
    }
    .text-grand-span{
    font-family: Halton;
    font-size: 18px;
    line-height: 17px;
    color: #73777B;
    }
}
.new-body{
    margin: 0px -10px;
}
.new-body__endereço{
    margin: 10px -10px 0px -10px;
}
.endereço{
    padding: 7px 10px 5px 12px;
    background: #23272B;
    border-radius: 2px;
    font-family: Halton;
    font-size: 14px;
    height: 32px;
    cursor: pointer;
}
.detalhes{
    padding: 7px 10px 5px 12px;
    background: #31363C;
    border-radius: 2px;
    font-family: Halton;
    font-size: 14px;
    height: 32px;
    cursor: pointer;
}
.new-form{
    height: 168px;
    background: #23272B;
    margin: 0px -10px 158px -10px;
    padding: 10px;
}
.new-inputs{
    border-bottom: 2px solid #373C42;;
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
    span{
    font-family: Halton;
    font-size: 14px;
    line-height: normal;
    color: #73777B;
    }
}
</style>
