module.exports = function(prefix, middleware) {
    return function (req, res, next) {
        if (req.url.indexOf(prefix) === 0) {
            req.url = req.url.slice(prefix.length);
            return middleware.call(this, req, res, next);
        }
        else {
            return next();
        }
    }
}
