<template>
  <div class="Reviews row">
    <div class="bloco">
      <div class="ballon1"><img src="../assets/Ballon1.png" /></div>
      <div>
        <p class="text1">
          Excepteur sint occaecat cupidatat,<br />
          dolore eu fugiat nulla pariatur.<br />
          Excepteur sint occaecat cupidatat<br />
          fugiat nulla pariatur
        </p>
      </div>
      <div class="user1"><img :src="card.user" style="width:50px" /></div>
      <div class="cx-p1">
        <div>
          <p class="reviews-name1">{{ card.nome }}</p>
        </div>
        <div>
          <p class="reviews-surname1">{{ card.surname }} - {{ card.cidade }} {{ card.estado }}</p>
        </div>
        <div class="stars1"><img :src="card.start" /></div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Reviews",
  status: "ready",
  release: "1.0.0",
  data() {
    return {
      card: {
        user: "../assets/User1.png",
        start: "../assets/stars1.png",
        nome: "Pedro Parente",
        surname: "Vip gás e água",
        cidade: "Maringá",
        estado: "PR",
      },
    }
  },
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
  float: left;
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
.user1 {
  position: absolute;
  top: 180px;
  left: 55px;
}

.reviews-name1 {
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
.cx-p1 {
  position: absolute;
  top: 180px;
  left: 120px;
}
</style>
