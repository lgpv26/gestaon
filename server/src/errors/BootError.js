import ExtendableError from 'es6-error'
import process from 'process'

import PrettyLogger from 'pretty-logger'

class BootError extends ExtendableError {
    // constructor is optional; you should omit it if you just want a custom error
    // type for inheritance and type checking
    constructor(message = 'Boot Error') {
        super(message)
        if(process.env.NODE_ENV === 'production' && this.hasOwnProperty('stack')) delete this.stack
        const prettyLogger = new PrettyLogger()
        prettyLogger.error(message)
    }
    setCode(code){
        this.code = code
    }
}

export default BootError