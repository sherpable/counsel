module.exports = class VueComponentTestWrapper
{
    constructor(testData)
    {
        this.wrapper = vueTestUtils.mount(testData.component, testData.config);

        this.vm = this.wrapper.vm;

        // this.wrapper.setData({ name: 'Product 1' });
        // this.wrapper.setProps(this.props);
    }

    static wrap(component)
    {
        return new this(component);
    }

    toHtml()
    {
        this.wrapper.update();
        return this.wrapper.html();
    }
}
