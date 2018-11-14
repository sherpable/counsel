module.exports = {
    /**
     * Proxy the different assertion calls.
     * This will call the appropriate method on the underlining instance
     * fetched from the container with the given parameters.
     * 
     * @param  {Facade}  target
     * @param  {string}  property
     * @param  {mixed}   receiver
     */
    get(target, property, receiver)
    {
        if (typeof target[property] == 'function') {
            return function(...args) {
               return target[property](...args);
            };
        }

        if (target[property] !== undefined) {
            return target[property];
        }

        let concrete = target.resolveBinding();

        if (typeof concrete[property] == 'function') {
            return function(...args) {
                return concrete[property](...args);
            };
        }

        if (concrete[property] !== undefined) {
            return concrete[property];
        }
    }
};
