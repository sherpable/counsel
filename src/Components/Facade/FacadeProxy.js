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
