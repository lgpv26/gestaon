<template>
    <div class="new-request__header">
           <span class="new-request__text">
            <img src="./Elements/ic-request-code.png">
            2324</span>
           <img src="./Elements/ic-call-in.png">
           <span class="new-request__text" >Maringás celular</span>
           <img src="./Elements/ic-down.png">
           <span style="flex-grow: 1"></span>

           <div class="new-request__img">
           <img src="./Elements/ic-share.png">
           <div class="new-request-circ">
               <span>0</span>
           </div>
          <img src="./Elements/ic-chat.png">
           <div class="new-request-circ">
               <span>0</span>
           </div>
           <img src="./Elements/ic-log.png">
           <div class="new-request-circ">
               <span>0</span>
           </div>
           <img src="./Elements/ic-remove.png">
           </div>
       </div>
</template>

<script>
export default {

}
</script>

<style lang="scss">
.new-request__header {
            height: 40px;
            background-color: #23272B;
            display: flex;
            flex-direction: row;
            align-items: center;
            flex-shrink: 0;
            /*justify-content: center;  */
            .new-request-circ{
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 24px;
                height: 24px;
                border-radius: 12px;
                position: relative;
                right: 12px;
                background: #31363C;
                margin: 0 8px;
                padding: 3px 0px;
            }
            .new-request__img{
                background-color: #23272B;
                display: flex;
                flex-direction: row;
                align-items: center;
                margin-right: 15px;
            }
            .new-request__text{
                font-family: Halton;
                font-size: 14px;
                color: #C3C5C6;
                padding: 0px 10px;
            }
        }
</style>
