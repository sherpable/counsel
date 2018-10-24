module.exports = class Facade
{
    /**
     * Create a new Facade instance.
     * 
     * @constructor
     * 
     * @param  {string}    bindingName
     */
    constructor(bindingName)
    {
        this.bindingName = bindingName;
    }

    /**
     * Resolve the underlining instance for the facade.
     * 
     * @return {void}
     */
    resolveBinding()
    {
        return counsel().resolve(this.bindingName);
    }
}
