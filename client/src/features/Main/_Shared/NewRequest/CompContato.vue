<template>
      <div  class="new-row" style="margin: 16px 0px 0px 0px;">
                <div class="new_bairro" style="margin: 0px 5px 0px 0px;max-width: 210px;"><span>Bairro</span><div>
                   <div>
                        <input style="max-width: 200px;" type="text">
                    </div>
                </div>
                </div>
                <div class="new_bairro" style="margin: 0px 5px 0px 5px;max-width: 103px;"><span>CEP</span><div>
                   <div>
                        <input  style="max-width: 93px;"  type="text">
                    </div>
                </div>
                </div>
                <div class="new_bairro" style="margin: 0px 5px 0px 5px;max-width: 210px;"><span>Cidade</span><div>
                   <div>
                        <input style="max-width: 190px;" type="text">
                    </div>
                </div>
                </div>
                <div class="new_bairro" style="margin: 0px 5px 0px 5px;max-width: 57px;"><span>UF</span><div>
                    <div class="new-row">
                        <input style="max-width: 30px;" type="text">
                        <div>
                            <img style="margin: 10px 0px 0px 0px;cursor: pointer;" src="./Elements/ic-down.png">
                        </div>
                    </div>
                </div>
                </div>
            </div>
</template>

<script>
export default {

}
</script>

<style lang="scss">

.new_bairro{
    border-bottom: 2px solid #373C42;
    padding-bottom: 6px;
    span{
    font-family: Halton;
    font-size: 14px;
    line-height: normal;
    color: #73777B;    
    }
    input[type="text"]{
    font-family: Halton;
    font-size: 18px;
    color: #E7E8E8;
    background: transparent;
    border: 0px;
    margin: 0px 5px;
    }
}
</style>
