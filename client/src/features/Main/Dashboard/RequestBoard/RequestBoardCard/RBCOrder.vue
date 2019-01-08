<template>
  <div>
    <div class="rbc-order" v-if="hasRequestOrderProducts">
      <div class="tooltip-content">
        <table>
          <thead>
            <tr>
              <th style="text-align: center; padding-right: 10px;">Qnt.</th>
              <th>Produto</th>
              <th style="padding-left: 10px; text-align: right">
                Desconto unit.
              </th>
              <th style="padding-left: 10px; text-align: right">Valor unit.</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(requestOrderProduct, index) in requestOrderProducts"
              :key="index"
            >
              <td style="text-align: center; padding-right: 10px;">
                {{ requestOrderProduct.quantity }}
              </td>
              <td>{{ requestOrderProduct.product.name }}</td>
              <td style="text-align: right">
                -
                {{
                  utils.formatMoney(
                    requestOrderProduct.unitDiscount,
                    2,
                    "R$ ",
                    ".",
                    ","
                  )
                }}
              </td>
              <td style="text-align: right">
                {{
                  utils.formatMoney(
                    requestOrderProduct.unitPrice,
                    2,
                    "R$ ",
                    ".",
                    ","
                  )
                }}
              </td>
            </tr>
            <tr>
              <td colspan="4" style="padding-top: 5px; text-align: right">
                {{ utils.formatMoney(orderSubtotal, 2, "R$ ", ".", ",") }}
              </td>
            </tr>
          </tbody>
          <tbody v-if="hasRequestPayments">
            <tr>
              <td colspan="4" style="padding-top: 10px;"></td>
            </tr>
            <tr v-for="(requestPayment, index) in requestPayments" :key="index">
              <td colspan="3" style="text-align: right">
                {{ requestPayment.paymentMethod.name }}
              </td>
              <td colspan="1" style="text-align: right">
                {{
                  utils.formatMoney(requestPayment.amount, 2, "R$ ", ".", ",")
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="tooltip-actions">
        <a
          href="javascript:void(0)"
          @click="
            runRequestRecoverance({
              requestId: request.id,
              companyId: company.id
            })
          "
          >Editar <icon-edit></icon-edit
        ></a>
      </div>
    </div>
    <div class="rbc-order" v-else>Nenhum produto neste pedido...</div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import RequestsAPI from "../../../../../api/requests";
import _ from "lodash";

export default {
  props: ["request"],
  data() {
    return {};
  },
  computed: {
    ...mapState("auth", ["company"]),
    orderSubtotal() {
      return _.sumBy(
        this.request.requestOrder.requestOrderProducts,
        requestOrderProduct => {
          return (
            (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount) *
            requestOrderProduct.quantity
          );
        }
      );
    },
    hasRequestOrderProducts() {
      const requestOrderProducts = _.get(
        this.card,
        "request.requestOrder.requestOrderProducts",
        false
      );
      if (requestOrderProducts && requestOrderProducts.length) {
        return requestOrderProducts;
      }
      return false;
    },
    requestOrderProducts() {
      return this.request.requestOrder.requestOrderProducts;
    },
    hasRequestPayments() {
      const requestPayments = _.get(this.request, "requestPayments", false);
      if (requestPayments && requestPayments.length) {
        return requestPayments;
      }
      return false;
    },
    requestPayments() {
      return this.request.requestPayments;
    }
  },
  methods: {
    ...mapActions("draft/request", ["runRequestRecoverance"]),
    runRecoverance() {
      RequestsAPI.recoverance(this.request.id, {
        companyId: this.company.id
      });
    }
  }
};
</script>

<style>
.rbc-order {
  display: flex;
  flex-direction: column;
  color: var(--font-color--10);
}
.tooltip-content {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  text-align: left;
  min-width: 260px;
}
.tooltip-content table th {
  font-size: 12px;
  font-weight: normal;
  color: var(--font-color--8);
}
.tooltip-content table td {
  font-size: 12px;
  font-weight: 600;
  color: var(--font-color--8);
}
.tooltip-content span {
  font-size: 12px;
  font-weight: 600;
  color: var(--font-color--8);
}
.tooltip-actions {
  display: flex;
  flex-direction: row;
}
.tooltip-actions a {
  font-weight: 600;
  border-bottom: 0;
  color: var(--font-color--10);
}
</style>
