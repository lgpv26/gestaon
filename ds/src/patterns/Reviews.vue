<template>
<div class="Reviews row " style="position:relative;top:-105px;">
    <div class="ballon1">
      <img src="../assets/Ballon1.png" style= "width:400px" >
   </div>
   <div class="ballon2">
      <img src="../assets/Ballon2.png" style= "width:400px" >
    </div>
    <div class="ballon3">
      <img src="../assets/Ballon3.png" style= "width:400px" >
    </div>
    <div>
       <p class="text1"> Excepteur sint occaecat cupidatat,<br> 
           dolore eu fugiat nulla pariatur.<br>
           Excepteur sint occaecat cupidatat<br>
           fugiat nulla pariatur</p> 
    </div>
    <div>
       <p class="text2"> Excepteur sint occaecat cupidatat,<br> 
           dolore eu fugiat nulla pariatur.<br>
           Excepteur sint occaecat cupidatat<br>
           fugiat nulla pariatur</p> 
    </div>
    <div>
       <p class="text3"> Excepteur sint occaecat cupidatat,<br> 
           dolore eu fugiat nulla pariatur.<br>
           Excepteur sint occaecat cupidatat<br>
           fugiat nulla pariatur</p> 
    </div>
    <div class="user1">
      <img src="../assets/User1.png" style= "width:50px" >
   </div>
   <div class="user2">
      <img src="../assets/User2.png" style= "width:50px" >
   </div>
   <div class="user3">
      <img src="../assets/User3.png" style= "width:50px" >
   </div>
   <div><p class="reviews-name1">Pedro Parente</p></div>
   <div><p class="reviews-name2">Pedro Parente</p></div>
   <div><p class="reviews-name3">Pedro Parente</p></div>
   <div><p class="reviews-surname1">Vip gás e água - Maringá PR</p></div>
   <div><p class="reviews-surname2">Vip gás e água - Maringá PR</p></div>
   <div><p class="reviews-surname3">Vip gás e água - Maringá PR</p></div>
   <div class="stars1">
      <img src="../assets/stars1.png">
    </div>
    <div class="stars2">
      <img src="../assets/stars2.png">
    </div>
    <div class="stars3">
      <img src="../assets/stars3.png">  
   </div>
</div>
</template>
<script>
export default {
  name: "Reviews",
  status: "ready",
  release: "1.0.0"
}
</script>

<style>
@import "../../src/assets/fonts/montserrat.css";
.Reviews {
  max-width: 1245px;
  margin: 0px auto 0px auto;
  position: relative;
  height: 850px;
  background: #ffffff;
}
.ballon1 {
    position: absolute;
    top:100px;
    left:50px;
}
.ballon2{
    position: absolute;
    top:30px;
    left: 500px;
}
.ballon3{
    position: absolute;
    top:100px;
    left:930px;
}
.text1{
    position: absolute;
    top:120px;
    left:100px;
    font-weight: 20px;
    font-family: Montserrat-Alternates;
    color: #276E73;
}
.text2{
    position: absolute;
    top:50px;
    left:550px;
    font-weight: 20px;
    font-family: Montserrat-Alternates;
    color: #276E73;
}
.text3{
    position: absolute;
    top:120px;
    left:980px;
    font-size: 15px;
    font-family: Montserrat-Alternates;
    color: #276E73;
}
.user1{
    position: absolute;
    top:280px;
    left:93px;
}
.user2{
    position: absolute;
    top:210px;
    left:543px;
}
.user3{
    position: absolute;
    top: 280px;
    left: 973px;
}
.reviews-name1{
    position: absolute;
    top:263px;
    left:160px;
    font-family: Montserrat-Alternates;
    font-size:15px;
    color: #276E73;
    font-weight: bold;
}
.reviews-name2{
    position: absolute;
    top:193px;
    left:610px;
    font-family: Montserrat-Alternates;
    font-size:15px;
    color: #276E73;
    font-weight: bold;
}
.reviews-name3{
    position: absolute;
    top:263px;
    left:1040px;
    font-family: Montserrat-Alternates;
    font-size:15px;
    color: #276E73;
    font-weight: bold;
}
.reviews-surname1{
    position: absolute;
    top:287px;
    left:160px;
    font-family: Montserrat-Alternates;
    font-size:12px;
    color: #276E73;
}
.reviews-surname2{
    position: absolute;
    top:217px;
    left:610px;
    font-family: Montserrat-Alternates;
    font-size:12px;
    color: #276E73;
}
.reviews-surname3{
    position: absolute;
    top:287px;
    left:1040px;
    font-family: Montserrat-Alternates;
    font-size:12px;
    color: #276E73;
}
.stars1{
    position: absolute;
    top:317px;
    left:158px;
}
.stars2{
    position: absolute;
    top:245px;
    left:608px;
}
.stars3{
    position: absolute;
    top:317px;
    left:1038px;
}
</style>