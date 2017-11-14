const _ = require('lodash');
const Op = require('sequelize').Op;
const moment = require('moment');

module.exports = (server, restify) => {
    return (req, res, next) => {

        return new Promise((resolve, reject) => {
            const queryObj = { limit: _.has(req.query, "limit") ? _.parseInt(req.query.limit) : 2 };
           
            if (_.has(req.query, "offset")) queryObj.offset = _.parseInt(req.query.offset)

            if (_.has(req.query, "filter")) {
                //filter=colunm:operator(paramsOne,paramsTwo);anotherOperator(paramsOne,paramsTwo,paramsThree)|anotherColunm:operator(paramsOne)
                let filterQuery = req.query.filter.split('|')
                filterQuery = (filterQuery.length > 1) ? filterQuery : req.query.filter;
                const operandShouldOne = ['gt', 'gte', 'lt', 'lte', 'ne', 'eq']
                queryObj.where = {}

                const filterFunction = (arrayFilters) => {                    
                    if (!_.includes(arrayFilters, ":")) {
                        return reject(new restify.BadDigestError({
                            body: {
                                "code": 'BAD_REQUEST',
                                "message": 'Filter format is not correct.'
                            }
                        }));
                    }
                    const operatorObj = {}
                    _.last(arrayFilters.split(':')).split(';').forEach((dataQuery) => {                        
                        const operatorQuery = _.first(dataQuery.split("(")) // returns string => dataQuery = operator((paramsOne,paramsTwo,paramsThree)
                        const paramsQuery = (dataQuery.slice((dataQuery).indexOf('(') + 1, dataQuery.indexOf(')'))).split(',') // VER PARA FAZER EM EXPRESSAO REGULAR QUE MAIS MIO DE BAO
                        if (_.includes(operandShouldOne, operatorQuery) && paramsQuery.length > 1) {
                            return reject(new restify.BadDigestError({
                                body: {
                                    "code": 'BAD_REQUEST',
                                    "message": 'This operator must have only one argument.'
                                }
                            }));
                        }

                        if(!_.includes(dataQuery, "(")){
                            return reject(new restify.BadDigestError({
                                body: {
                                    "code": 'BAD_REQUEST',
                                    "message": 'Filter format is not correct.'
                                }
                            }));
                        }
                        // Comentar em ingles burro | To be reviewed
                        operatorObj[Op[operatorQuery]] = (paramsQuery > 1000000001) ? moment.unix(_.parseInt(paramsQuery)).format().toString() : paramsQuery
                    })
                    queryObj.where[_.first(arrayFilters.split(':'))] = operatorObj ? operatorObj : {}
                }


                if (_.isArray(filterQuery)) {
                    filterQuery.forEach((arrayFilters) => {
                        filterFunction(arrayFilters);
                    })
                }
                else {
                    filterFunction(filterQuery);
                }
            }

            if (_.has(req.query, "sort")) {
                //sort=key1:asc,key2
                // OBJ order: { [ ['dateCreated', 'DESC'], [KEY1] , ['userId', 'ASC'] ] }
                const sortQuery = (req.query.sort.split(',').length > 1) ? req.query.sort.split(',') : req.query.sort;

                let arrayOrder = []
                if (_.isArray(sortQuery)) {
                    sortQuery.forEach((arraySort) => {
                        if (_.includes(arraySort, ":")) {
                            if (!_.includes(['asc', 'desc'], _.last(arraySort.split(":")))) {
                                return reject(new restify.BadDigestError({
                                    body: {
                                        "code": 'BAD_REQUEST',
                                        "message": 'Sort format is not correct.'
                                    }
                                }));
                            }
                            arrayOrder = _.concat(arrayOrder, [[_.first(arraySort.split(":")), _.last(arraySort.split(":"))]])
                        }
                        else {
                            arrayOrder = _.concat(arrayOrder, [[arraySort]])
                        }
                    })
                }
                else {
                    if (_.includes(sortQuery, ":")) {
                        if (!_.includes(['asc', 'desc'], _.last(sortQuery.split(":")))) {
                            return reject(new restify.BadDigestError({
                                body: {
                                    "code": 'BAD_REQUEST',
                                    "message": 'Sort format is not correct.'
                                }
                            }));
                        }
                        arrayOrder = _.concat(arrayOrder, [[_.first(sortQuery.split(":")), _.last(sortQuery.split(":"))]])
                    }
                    else {
                        arrayOrder = _.concat(arrayOrder, [[sortQuery]])
                    }
                }
                queryObj.order = arrayOrder
            }
            return resolve(queryObj)
        }).then((queryParser) => {
            req.queryParser = queryParser || {}
            return next()
        }).catch((err) => {
            return next(err)
        });
    }
};