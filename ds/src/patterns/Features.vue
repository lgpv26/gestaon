<template>
  <div class="Features row">
    <div class="col-md-12" style="position:relative;top:-119px;">
      <img src="../assets/Rectangle 2.png" style="width:100%" />
      <div class="col-md-12" style="position:relative;top:-50px;left:-60px;">
        <ul>
          <li><a class="t" href="javascript:void(0)" @click="tab = 1">Atendimento</a></li>
          <li><a class="t" href="javascript:void(0)" @click="tab = 2">Vendas</a></li>
          <li><a class="t" href="javascript:void(0)" @click="tab = 3">Logística</a></li>
          <li><a class="t" href="javascript:void(0)" @click="tab = 4">Financeiro</a></li>
          <li><a class="t" href="javascript:void(0)" @click="tab = 5">Relatórios</a></li>
        </ul>
      </div>
    </div>
    <div v-if="tab === 1" style="width: 100%">
      <div style="position:absolute;top:0px;left:200px;">
        <h2 class="p" style="font-size:24px;color: #276E73;">
          Recursos definitivos que te ajudam a<br />gerenciar a venda e distribuição
        </h2>
      </div>
      <div style="padding:0px 0px 0px 150px;position:absolute;top:90px;">
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">Pesquisa inteligente, rápida e offline</div>
          <div style="padding-left:0px 25px 0px 30px;">
            <p class="text">
              Pesquisa de clientes com campo único, o que você digita é analisado na hora; como
              no Google, a parte complicada fica com a gente, não precisa um monte de campos para
              encontrar o cliente cadastrado ou incluir um novo.
            </p>
          </div>
        </div>
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">Tudo sincronizado em uma tela</div>
          <div>
            <p class="text">
              Múltiplos atendimentos, múltiplos endereços, múltiplos recebimentos e muitos outros múltiplos funcionando na nuvem e fora dela quando não há
              conexão com a internet.
            </p>
          </div>
        </div>
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">Destino identificado</div>
          <div>
            <p class="text">
              Quando o cliente liga, a busca pelo endereço e histórico de compras é automática.
              A linha de destino pode ser nomeada, permitindo um atendimento personalizado e
              medição das vendas por telefone divulgado.
            </p>
          </div>
        </div>
        <div class="col-md-6 c" style="position:relative">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">Controle em uma tela</div>
          <div>
            <p class="text">
              Os pedidos no painel de atendimento são rapidamente editáveis sem precisar 
              mudar de tela, tudo é sincronizado e salvo em tempo real. Cadastre clientes e 
              realize as vendas mesmo sem internet. 
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="tab === 2" style="width: 100%">
      <div style="position:absolute;top:0px;left:200px;">
        <h2 class="p" style="font-size:24px;color: #276E73;">
          Recursos definitivos que te ajudam a<br />gerenciar a venda e distribuição
        </h2>
      </div>
      <div style="padding:0px 0px 0px 150px;position:absolute;top:90px;">
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div style="padding-left:0px 25px 0px 30px;">
            <p class="text">
            Retenha clientes e evite a inadimplência, visualize o histórico de compras, 
            crédito disponível e vendas a prazo no momento da negociação.
            </p>
          </div>
        </div>
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div>
            <p class="text">
               Precisa alterar dados de um atendimento, como a forma de pagamento 
               no pedido finalizado? Faça isso na hora, sem precisar cancelar a venda 
               e perder tempo.
            </p>
          </div>
        </div>
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div>
            <p class="text">
              Atendentes ou vendedores precisam se comunicar rapidamente durante um atendimento?
              É só iniciar um chat em tempo real dentro do pedido! 
            </p>
          </div>
        </div>
        <div class="col-md-6 c" style="position:relative">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div>
            <p class="text">
              Durante o processo de venda assinale poucos campos que podem ser 
              obrigatórios ou não para gerar indicadores importantes sobre seus canais de 
              divulgação e grupos de cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="tab === 3" style="width: 100%">
      <div style="position:absolute;top:0px;left:200px;">
        <h2 class="p" style="font-size:24px;color: #276E73;">
          Recursos definitivos que te ajudam a<br />gerenciar a venda e distribuição
        </h2>
      </div>
      <div style="padding:0px 0px 0px 150px;position:absolute;top:90px;">
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div style="padding-left:0px 25px 0px 30px;">
            <p class="text">
               Direcione os pedidos de vendas para o aplicativo do vendedor com um 
               clique ou ative o encaminhamento automático e gerencie o tempo e o 
               sucesso das entregas
            </p>
          </div>
        </div>
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div>
            <p class="text">
              Qual é prioridade das entregas? Os pedidos possuem indicação de 
              urgência por escala de cor, minutos transcorridos e pedidos agendados
            </p>
          </div>
        </div>
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div>
            <p class="text">
              Desenhe no mapa suas regiões de atendimento, acompanhe o 
              deslocamento de seus agentes de logística e a proximidade com os clientes, 
              trace rotas para entender o histórico das entregas
            </p>
          </div>
        </div>
        <div class="col-md-6 c" style="position:relative">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div>
            <p class="text">
              Controle o estoque e itens em trânsito por entrada manual ou QR Code. 
              Atualize o nível de estoque pelas compras e fechamento das vendas nos aplicativos.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="tab === 4" style="width: 100%">
      <div style="position:absolute;top:0px;left:200px;">
        <h2 class="p" style="font-size:24px;color: #276E73;">
          Recursos definitivos que te ajudam a<br />gerenciar a venda e distribuição
        </h2>
      </div>
      <div style="padding:0px 0px 0px 150px;position:absolute;top:90px;">
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div style="padding-left:0px 25px 0px 30px;">
            <p class="text">
              A conferência das entregas é feita rapidamente pela atendente via 
              aplicativo móvel do vendedor e painel web, os valores recebidos são 
              recolhidos e posteriormente conferidos na conciliação financeira
            </p>
          </div>
        </div>
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div>
            <p class="text">
              Cada operador com perfil de vendas tem sua própria conta/carteira. 
              Sendo possível realizar conferência de entregas, sangria de caixa e 
              lançamento de despesas de forma simplificada
            </p>
          </div>
        </div>
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div>
            <p class="text">
              Analisar o Fluxo de caixa e o Demostrativo de Resultados Operacional é 
              fundamental para o sucesso do negócio, cuidamos para que esses dados 
              sejam apresentados de forma de objetiva. Você só precisa fazer os 
              lançamentos de despesas de forma precisa, já que as vendas são 
            </p>
          </div>
        </div>
      </div>
      </div>
    <div v-if="tab === 5" style="width: 100%">
      <div style="position:absolute;top:0px;left:200px;">
        <h2 class="p" style="font-size:24px;color: #276E73;">
          Recursos definitivos que te ajudam a<br />gerenciar a venda e distribuição
        </h2>
      </div>
      <div style="padding:0px 0px 0px 150px;position:absolute;top:90px;">
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div style="padding-left:0px 25px 0px 30px;">
            <p class="text">
              Crie ações de marketing associadas a regiões, canais de vendas e grupo de 
              clientes e se concentre onde houver maior retorno sobre o investimento 
            </p>
          </div>
        </div>
        <div class="col-md-6 c" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div>
            <p class="text">
              Relatórios e indicadores precisos por vendedor, veículos, posição do estoque 
              nas bases, em trânsito, mcmm
            </p>
          </div>
        </div>
        <div class="col-md-6" style="position:relative;">
          <div style="position:absolute;top:-2px;left:80px;">
            <img src="../assets/adv-icon.png" />
          </div>
          <div class="g1">#</div>
          <div>
            <p class="text">
              No GestaON você pode mapear todos os clientes em potenciais de uma 
              região e comparar com as vendas realizadas, fica fácil saber para onde 
              direcionar sua próxima ação de marketing
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="vec"><img src="../assets/Vector6.png" /></div>
    <div style="text-align:center;position:absolute;top:660px;left:350px;">
      <h2 style="font-size:28px;margin:0px;color: #276E73;font-family: Montserrat-Alternates;">
        O que estão dizendo sobre o GestaON?
      </h2>
      <p style="font-size:20px;margin:0px;color: #276E73;font-family: Montserrat-Alternates;">
        Duis aute irure dolor in reprehenderit
      </p>
    </div>
    <div class="v2"><img src="../assets/v2banner.png" /></div>
    <div class="vector"><img src="../assets/Feature-vector.png" /></div>
    <div class="caminhao"><img src="../assets/map-mobile.png" /></div>
    <div class="nave"><img src="../assets/nave.png" /></div>
    <div class="map"><img src="../assets/Search.png" /></div>
  </div>
</template>

<script>
export default {
  name: "Features",
  status: "ready",
  release: "1.0.0",
  data(){
    return {
      tab: 0
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
@import "../../src/assets/fonts/montserrat.css";
.Features {
  max-width: 1245px;
  margin: 0px auto 0px auto;
  position: relative;
  height: 850px;
  background: #ffffff;
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
  padding: 22px 50px 22px 50px;
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
  top: 100px;
  margin-left:30px;
  margin-top:0px;
}

.c {
  font-family: Montserrat-Alternates;
  color: #276e73;
  font-size: 12px;
}

.g1 {
  font-family: Montserrat;
  font-size: 17px;
  color: #276e73;
  font-style: normal;
  margin-left: 110px;
}

.t {
  font-family: Montserrat;
  font-weight: bold;
  font-size: 12px;
}
.vector {
  position: absolute;
  top: 525px;
}
.vector img {
  width: 100%;
}
.map {
  position: absolute;
  top: 28px;
  left: 880px;
}
.map img {
  width: 100%;
}
.nave {
  position: absolute;
  top: 75px;
  left: 740px;
  z-index: 1;
}
.nave img {
  width: 50%;
}
.caminhao {
  position: absolute;
  top: 440px;
  left: 50px;
  margin-left: 55%;
  z-index: 1;
}
.caminhao img {
  width: 68%;
}
.text {
  margin-top: 5px;
  text-align: justify;
  margin-left: 75px;
  margin-bottom: 20px;
}
.v2 {
  position: absolute;
  top: 20px;
}
.v2 img {
  width: 100%;
}
.vec {
  position: absolute;
  top: 618px;
}
.vec img {
  width: 100%;
}

</style>

<docs>
  ```jsx
  <Features />
  ```
</docs>
