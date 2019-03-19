export default class ProductModel {
    constructor({ id = null, name = '', price = 0 } = {}){
        this.id = id
        this.name = name
        this.price = price
    }
}

export function createProduct(data){
    return new ProductModel(data)
}