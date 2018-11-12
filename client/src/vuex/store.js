import Vue from 'vue'
import Vuex from 'vuex'
import VuexORM from '@vuex-orm/core'
import * as mutations from './mutations'
import * as actions from './actions'
import modules from './modules'

import Address from './models/Address'
import Window from './models/Window'
import Call from './models/Call'
import User from './models/User'
import Client from './models/Client'
import ClientGroup from './models/ClientGroup'
import ClientPhone from './models/ClientPhone'
import ClientAddress from './models/ClientAddress'
import PromotionChannel from './models/PromotionChannel'
import PaymentMethod from './models/PaymentMethod'
import Product from './models/Product'
import Request from './models/Request'
import RequestPayment from './models/RequestPayment'
import RequestOrder from './models/RequestOrder'
import RequestOrderProduct from './models/RequestOrderProduct'
import RequestClientAddress from './models/RequestClientAddress'
import Section from './models/Section'
import Card from './models/Card'

import users from './orm-modules/users'
import addresses from './orm-modules/addresses'
import windows from './orm-modules/windows'
import calls from './orm-modules/calls'
import clients from './orm-modules/clients'
import clientGroups from './orm-modules/client-groups'
import clientAddresses from './orm-modules/client-addresses'
import clientPhones from './orm-modules/client-phones'
import requests from './orm-modules/requests'
import promotionChannels from './orm-modules/promotion-channels'
import paymentMethods from './orm-modules/payment-methods'
import products from './orm-modules/products'
import requestPayments from './orm-modules/request-payments'
import requestOrders from './orm-modules/request-orders'
import requestOrderProducts from './orm-modules/request-order-products'
import requestClientAddresses from './orm-modules/request-client-addresses'
import sections from './orm-modules/sections'
import cards from './orm-modules/cards'

Vue.use(Vuex);

const database = new VuexORM.Database()

database.register(User, users)
database.register(Address, addresses)
database.register(Window, windows)
database.register(Client, clients)
database.register(ClientPhone, clientPhones)
database.register(ClientAddress, clientAddresses)
database.register(ClientGroup, clientGroups)
database.register(Call, calls)
database.register(PromotionChannel, promotionChannels)
database.register(PaymentMethod, paymentMethods)
database.register(Product, products)
database.register(Request, requests)
database.register(RequestPayment, requestPayments)
database.register(RequestOrder, requestOrders)
database.register(RequestOrderProduct, requestOrderProducts)
database.register(RequestClientAddress, requestClientAddresses)
database.register(Section, sections)
database.register(Card, cards)

export default new Vuex.Store({
    plugins: [VuexORM.install(database)],
    state: {
        app: {
            title: "ERP",
            header: "request-board",
            version: null
        },
        system: {
            initialized: false
        },
        mainContentArea: {
            height: 0,
            width: 0
        },
        dimensions: {
            window: {
                width: 0,
                height: 0
            }
        }
    },
    mutations,
    actions,
    modules,
    strict: true
})
