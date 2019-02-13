<template>
  <div class="Features row">
    <div class="col-md-12" style="position:relative;top:-118px;">
      <img src="../assets/Rectangle 2.png" style="width:100%" />
      <div class="col-md-12" style="position:relative;top:-50px;">
        <ul>
          <li><a class="t" href="#">Atendimento</a></li>
          <li><a class="t" href="#">Vendas</a></li>
          <li><a class="t" href="#">Logística</a></li>
          <li><a class="t" href="#">Financeiro</a></li>
          <li><a class="t" href="#">Fiscal</a></li>
        </ul>
      </div>
    </div>
    <div style="position:relative;top:-20px;left:240px;">
      <h2 class="p" style="font-size:28px;color: #276E73;">
        Recursos que fazem a<br />diferença nos detalhes
      </h2>
    </div>
    <div class="row col-md-12" style="padding:0px 260px 0px 210px;">
      <div class="col-md-6 c" style="position:relative;">
        <div style="position:absolute;top:20px;left:35px;">
          <img src="../assets/adv-icon.png" />
        </div>
        <div style="padding-left:60px;"><h2>Controle em uma tela</h2></div>
        <div style="padding:0px 30px 0px 30px;">
          <p>
            Os pedidos no painel de atendimento são rapidamente editáveis sem precisar mudar de
            tela, tudo é sincronizado e salvo em tempo real. Cadastre clientes e realize as vendas
            mesmo sem internet
          </p>
        </div>
      </div>
      <div class="col-md-6 c" style="position:relative;left:50px;">
        <div style="position:absolute;top:20px;left:35px;">
          <img src="../assets/adv-icon.png" />
        </div>
        <div style="padding-left:60px;"><h2>Destino identificado</h2></div>
        <div style="padding:0px 30px 0px 30px;">
          <p>
            Quando o cliente liga, a busca pelo endereço e histórico de compras é automática. A
            linha de destino pode ser nomeada, permitindo um atendimento personalizado e medição das
            vendas por telefone divulgado
          </p>
        </div>
      </div>
      <div class="col-md-6 c" style="position:relative;">
        <div style="position:absolute;top:20px;left:35px;">
          <img src="../assets/adv-icon.png" />
        </div>
        <div style="padding-left:60px;"><h2>Pesquisa inteligente</h2></div>
        <div style="padding:0px 30px 0px 30px;">
          <p>
            Pesquisa de clientes com campo único, o que você digita é analisado na hora; como no
            Google, a parte complicada fica com a gente, não precisa um monte de campos para
            encontrar o cliente cadastrado ou incluir um novo
          </p>
        </div>
      </div>
      <div class="col-md-6 c" style="position:relative;left:50px;">
        <div style="position:absolute;top:20px;left:35px;">
          <img src="../assets/adv-icon.png" />
        </div>
        <div style="padding-left:60px;"><h2>Tudo sincronizado</h2></div>
        <div style="padding:0px 30px 0px 30px;">
          <p>
            Trabalhe com atendimento múltiplos atendimentos, múltiplos endereços, múltiplos
            recebimentos e muitos outros múltiplos funcionando na nuvem e fora dela quando não há
            conexão com a internet. A sua empresa precisa ser única
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Features",
  status: "ready",
  release: "1.0.0",
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
@import "../../src/assets/fonts/montserrat.css";
.Features {
  max-width: 1245px;
  margin: 0px auto 0px auto;
  position: relative;
}
ul {
  background: #31363c;
  padding-left: 200px;
}
li {
  list-style-type: none;
  float: left;
  margin-left: 20px;
}
a {
  padding: 22px 40px 22px 40px;
  color: white;
  border-radius: 5px;
  text-decoration: none;
}
li a:hover {
  background: linear-gradient(216.93deg, #49dfea -10.02%, #0072e4 91.15%);
}
.p {
  font-family: Montserrat-Alternates;
  color: #276e73;
  font-weight: 300;
}

.c {
  font-family: Montserrat-Alternates;
  color: #276e73;
  font-weight: 300;
  font-size: 15px;
}

.t {
  font-family: Montserrat;
  font-weight: bold;
  font-size: 12px;
}
</style>

<docs>
  ```jsx
  <Features />
  ```
</docs>
