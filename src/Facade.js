module.exports = class Facade
{
    constructor(bindingName)
    {
        this.bindingName = bindingName;
    }

    resolveBinding()
    {
        return counsel().resolve(this.bindingName);
    }
}