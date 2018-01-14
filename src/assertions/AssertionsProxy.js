module.exports = {
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

        if (typeof target.assertions[property] == 'function') {
            return function(...args) {
                return target.execute(property, args);
            };
        }

        if (target.assertions[property] !== undefined) {
            return target.assertions[property];
        }
    }
};
