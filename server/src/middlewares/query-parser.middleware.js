const _ = require('lodash');
const Op = require('sequelize').Op
const moment = require('moment')

module.exports = (server, restify) => {
    return (columnFind, res, next) => {
        const queryFnc = (req, res, next) => {

            return new Promise((resolve, reject) => {
                const queryObj = { limit: _.has(req.query, "limit") ? _.parseInt(req.query.limit) : 2 };
                if (_.isString(columnFind) && req.params.id) queryObj.where = { [columnFind]: req.params.id }
                
                if (_.has(req.query, "offset")) queryObj.offset = _.parseInt(req.query.offset)

                if (_.has(req.query, "filter")) {
                    //filter=colunm:operator(paramsOne,paramsTwo);anotherOperator(paramsOne,paramsTwo,paramsThree)|anotherColunm:operator(paramsOne)
                    let filterQuery = req.query.filter.split('|')
                    filterQuery = (filterQuery.length > 1) ? filterQuery : req.query.filter;
                    const operandShouldOne = ['gt', 'gte', 'lt', 'lte', 'ne', 'eq']
                    const regexFilter = /[a-zA-Z0-9]+/g
                    if (!columnFind && !req.params.id) queryObj.where = {}

                    const filterFunction = (filtersParams) => {

                        if (!_.includes(filtersParams, ":")) {
                            return reject(new restify.BadDigestError({
                                body: {
                                    "code": 'BAD_REQUEST',
                                    "message": 'Filter format is not correct.'
                                }
                            }));
                        }
                        let arrayFilters = filtersParams.split(':')
                        const colunmFilter = arrayFilters[0]
                        const operatorObj = {}

                        _.last(arrayFilters).split(';').forEach((dataQuery) => {
                            const dataArrayFilter = dataQuery.match(regexFilter)
                            const operatorQuery = dataArrayFilter[0]
                            dataArrayFilter.splice(0, 1) // returns string => dataQuery = operator(paramsOne,paramsTwo,paramsThree)
                            const paramsQuery = dataArrayFilter//return => filter's params with REGEX

                            if (_.includes(operandShouldOne, operatorQuery) && paramsQuery.length > 1) {
                                return reject(new restify.BadDigestError({
                                    body: {
                                        "code": 'BAD_REQUEST',
                                        "message": 'This operator must have only one argument.'
                                    }
                                }));
                            }

                            if (!_.includes(dataQuery, "(")) {
                                return reject(new restify.BadDigestError({
                                    body: {
                                        "code": 'BAD_REQUEST',
                                        "message": 'Filter format is not correct.'
                                    }
                                }));
                            }
                            // To be reviewed because te paramsQuery change to timestamp when filter pass number above 1000000001
                            operatorObj[Op[operatorQuery]] = (paramsQuery > 1000000001) ? moment.unix(_.parseInt(paramsQuery)).format().toString() : paramsQuery
                        })
                        queryObj.where[colunmFilter] = operatorObj ? operatorObj : {}
                    }


                    if (_.isArray(filterQuery)) {
                        filterQuery.forEach((arrayFilters) => {
                            filterFunction(arrayFilters)
                        })
                    }
                    else {
                        filterFunction(filterQuery)
                    }
                }

                if (_.has(req.query, "sort")) {
                    //sort=key1:asc,key2
                    let sortQuery = req.query.sort.split(',')
                    sortQuery = (sortQuery.length > 1) ? sortQuery : req.query.sort;

                    let arrayOrder = []
                    const sortFunction = (arraySort) => {
                        if (_.includes(arraySort, ":")) {
                            const sortKey = arraySort.split(":")[0]
                            const sortOrder = arraySort.split(":")[1]
                            if (!_.includes(['asc', 'desc'], sortOrder)) {
                                return reject(new restify.BadDigestError({
                                    body: {
                                        "code": 'BAD_REQUEST',
                                        "message": 'Sort format is not correct.'
                                    }
                                }));
                            }
                            arrayOrder = _.concat(arrayOrder, [[sortKey, sortOrder]])
                        }
                        else {
                            arrayOrder = _.concat(arrayOrder, [[arraySort]])
                        }
                    }

                    if (_.isArray(sortQuery)) {
                        sortQuery.forEach((arraySort) => {
                            sortFunction(arraySort)
                        })
                    }
                    else {
                        sortFunction(sortQuery)
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
        if(_.isString(columnFind) || !columnFind) {
            return queryFnc
        }
        else {
            return queryFnc(columnFind, res, next)
        }
    }
}