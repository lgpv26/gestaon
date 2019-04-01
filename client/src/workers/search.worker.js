import _ from 'lodash'
import elasticlunr from 'elasticlunr'

// set elasticlunr tokenizer
elasticlunr.tokenizer = function(str) {
    //console.log(`-------- Executando ${arguments.length} ---------`)
    if (!arguments.length || str === null || str === undefined) return [];
    if (Array.isArray(str)) {
        let arr = str.filter(function(token) {
            return token !== null && token !== undefined
        });

        arr = arr.map(function(t) {
            return elasticlunr.utils.toString().toLowerCase();
        });

        let out = [];
        arr.forEach(function(item) {
            const tokens = item.split(elasticlunr.tokenizer.seperator);
            out = out.concat(tokens);
        }, this);

        return out;
    }

    // edge n-gram

    const strArray = str
        .toString()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .split(/,?\s+/);

    const edgeNGram = function(xD) {
        let i = 1;
        const wordLength = xD.length;
        const resultArray = [];
        while (i <= wordLength) {
            resultArray.push(xD.substr(0, i));
            i++;
        }
        return resultArray;
    };

    let finalArray = [];

    strArray.forEach(str => {
        finalArray = _.concat(finalArray, edgeNGram(str));
    });

    return finalArray;
}

const workerInstance = self

const searchIndexes = {
    clients: elasticlunr(function() {
        _.forEach(
            elasticlunr.Pipeline.registeredFunctions,
            (value, key) => {
                if (key === "stemmer") {
                    this.pipeline.remove(value);
                } else if (key === "stopWordFilter") {
                    this.pipeline.remove(value);
                }
            }
        );
        this.setRef("id");
        this.addField("name");
        this.addField("address");
        this.addField("complement");
        this.addField("number");
        this.addField("neighborhood");
        this.addField("city");
    }),
    addresses: elasticlunr(function() {
        _.forEach(
            elasticlunr.Pipeline.registeredFunctions,
            (value, key) => {
                if (key === "stemmer") {
                    this.pipeline.remove(value);
                } else if (key === "stopWordFilter") {
                    this.pipeline.remove(value);
                }
            }
        );
        this.setRef("id")
        this.addField("name")
        this.addField("address")
        this.addField("neighborhood")
        this.addField("city")
        this.addField("state")
        this.addField("cep")
        this.addField("country")
    })
}

/**
 * event should have { index, document, documents, operation = { add, bulkAdd, search } }
 */
workerInstance.addEventListener('message', (ev) => {
    ev = ev.data
    switch(ev.operation){
        case "add":
            searchIndexes[ev.index].addDoc(ev.document)
            console.log("Add operation finished", ev.document)
            workerInstance.postMessage({ taskId: ev.taskId })
            break;
        case "bulkAdd":
            ev.documents.forEach((document, index) => {
                searchIndexes[ev.index].addDoc(document)
                if (index === ev.documents.length - 1) {
                    console.log("Bulk add operation for " + ev.index + " finished", ev.documents)
                    workerInstance.postMessage({ taskId: ev.taskId })
                }
            })
            break;
        case "search":
            let documents = searchIndexes[ev.index].search(ev.query, ev.options)
            if(ev.options.limit){
                documents = documents.slice(0, ev.options.limit)
            }
            workerInstance.postMessage({ taskId: ev.taskId, documents })
            break;
    }
})