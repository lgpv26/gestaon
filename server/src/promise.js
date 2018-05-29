let limitPerConsult = 50
let offset = 0
let limitReached = false

const totalItemsLimit = 150

const itemsIds = []

const bunch = function(offset){
    return clients.findAll(offset, limitPerConsult).then((resultList) => {
        console.log("Consultou com offset " + offset + "-" + (offset + limitPerConsult) + "/" + totalItemsLimit)
        resultList.forEach((listItem) => {
            itemsIds.push(listItem.codigo_clientes)
        })
        offset += limitPerConsult
        if(offset > totalItemsLimit){
            limitPerConsult = offset - totalItemsLimit
            limitReached = true
        }

        if(!limitReached){
            bunch(offset)
        }
        else {
            console.log("Consulta encerrada!")
        }
    })
}

bunch(offset)