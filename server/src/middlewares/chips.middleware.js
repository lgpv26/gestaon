module.exports = function(prefix, middleware) {
    return function (req, res, next) {

        if(req.query.hasOwnProperty("chips")){
            return next();
        }

        let chips = req.query.chips;

        return next();
    }
}
