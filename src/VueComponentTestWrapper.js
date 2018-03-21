module.exports = class VueComponentTestWrapper
{
    constructor(testData)
    {
        this.wrapper = vueTestUtils.mount(testData.component, testData.config);

        this.vm = this.wrapper.vm;
    }

    static wrap(component)
    {
        return new this(component);
    }

    html()
    {
        this.wrapper.update();
        return this.wrapper.html();
    }
}
