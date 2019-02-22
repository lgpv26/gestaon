<template>
  <div class="Reviews row">
    <div class="col-md-4 ">
      <div class="ballon1"><img src="../assets/Ballon1.png" /></div>
      <div>
        <p class="text1">
          Excepteur sint occaecat cupidatat,<br />
          dolore eu fugiat nulla pariatur.<br />
          Excepteur sint occaecat cupidatat<br />
          fugiat nulla pariatur
        </p>
      </div>
      <div class="user1"><img src="../assets/User1.png" style="width:50px" /></div>
      <div class="cx-p1">
        <div><p class="reviews-name1">Pedro Parente</p></div>
        <div><p class="reviews-surname1">Vip gás e água - Maringá PR</p></div>
        <div class="stars1"><img src="../assets/stars1.png" /></div>
      </div>
    </div>

    <div class="col-md-4 ">
      <div class="ballon2"><img src="../assets/Ballon2.png" /></div>
      <div>
        <p class="text2">
          Excepteur sint occaecat cupidatat,<br />
          dolore eu fugiat nulla pariatur.<br />
          Excepteur sint occaecat cupidatat<br />
          fugiat nulla pariatur
        </p>
      </div>
      <div class="user2"><img src="../assets/User2.png" style="width:50px" /></div>
      <div class="cx-p2">
        <div><p class="reviews-name2">Pedro Parente</p></div>
        <div><p class="reviews-surname2">Vip gás e água - Maringá PR</p></div>
        <div class="stars2"><img src="../assets/stars1.png" /></div>
      </div>
    </div>

    <div class="col-md-4 ">
      <div class="ballon3"><img src="../assets/Ballon3.png" /></div>
      <div>
        <p class="text3">
          Excepteur sint occaecat cupidatat,<br />
          dolore eu fugiat nulla pariatur.<br />
          Excepteur sint occaecat cupidatat<br />
          fugiat nulla pariatur
        </p>
      </div>
      <div class="user3"><img src="../assets/User3.png" style="width:50px" /></div>
      <div class="cx-p3">
        <div><p class="reviews-name3">Pedro Parente</p></div>
        <div><p class="reviews-surname3">Vip gás e água - Maringá PR</p></div>
        <div class="stars3"><img src="../assets/stars3.png" /></div>
      </div>
    </div>
    <div style="text-align:center">
      <span class="dot"></span> <span class="dot"></span> <span class="dot"></span>
    </div>
  </div>
</template>
<script>
export default {
  name: "Reviews",
  status: "ready",
  release: "1.0.0",
}
</script>

<style>
@import "../../src/assets/fonts/montserrat.css";
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
.Reviews {
  max-width: 1245px;
  margin: 0px auto 0px auto;
  position: relative;
  height: 350px;
  background: #ffffff;
}
.text1 {
  position: absolute;
  top: 20px;
  left: 80px;
  text-align: center;
  font-weight: 20px;
  font-family: Montserrat-Alternates;
  color: #276e73;
}
.text2 {
  position: absolute;
  top: 20px;
  left: 490px;
  text-align: center;
  font-weight: 20px;
  font-family: Montserrat-Alternates;
  color: #276e73;
}
.text3 {
  position: absolute;
  top: 20px;
  left: 910px;
  text-align: center;
  font-size: 15px;
  font-family: Montserrat-Alternates;
  color: #276e73;
}
.user1 {
  position: absolute;
  top: 180px;
  left: 55px;
}
.user2 {
  position: absolute;
  top: 180px;
  left: 470px;
}
.user3 {
  position: absolute;
  top: 180px;
  left: 885px;
}
.reviews-name1 {
  margin: 0px 0px 0px 0px;
  font-family: Montserrat-Alternates;
  font-size: 15px;
  color: #276e73;
  font-weight: bold;
}
.reviews-name2 {
  margin: 0px 0px 0px 0px;
  font-family: Montserrat-Alternates;
  font-size: 15px;
  color: #276e73;
  font-weight: bold;
}
.reviews-name3 {
  margin: 0px 0px 0px 0px;
  font-family: Montserrat-Alternates;
  font-size: 15px;
  color: #276e73;
  font-weight: bold;
}
.reviews-surname1 {
  margin: 2px 0px 2px 0px;
  font-family: Montserrat-Alternates;
  font-size: 12px;
  color: #276e73;
}
.reviews-surname2 {
  margin: 2px 0px 2px 0px;
  font-family: Montserrat-Alternates;
  font-size: 12px;
  color: #276e73;
}
.reviews-surname3 {
  margin: 2px 0px 2px 0px;
  font-family: Montserrat-Alternates;
  font-size: 12px;
  color: #276e73;
}
.cx-p1 {
  position: absolute;
  top: 180px;
  left: 120px;
}
.cx-p2 {
  position: absolute;
  top: 180px;
  left: 540px;
}
.cx-p3 {
  position: absolute;
  top: 180px;
  left: 955px;
}
</style>
