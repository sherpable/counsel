const renderer = require('vue-server-renderer').createRenderer();

module.exports = class VueComponentWrapper
{
	constructor(vm)
	{
		this.vm = vm;
	}

	static wrap(vm)
	{
		return new this(vm);
	}

    setProps(props)
    {
        this.vm.props = props;

        return this;
    }

	fastForward(timeExpression)
    {
        let time = parseFloat(timeExpression);

        if(timeExpression.substr(timeExpression.length - 2) != 'ms' && timeExpression.substr(timeExpression.length - 1) == 's') {
            time *= 1000;
        }

        this.tester.clock.tick(time);
    }

    async toHtml()
    {
        this.update();

        return await this.renderAsString();
    }

    async renderAsString()
    {
        let html = await renderer.renderToString(this.vm);
        return html.replace(' data-server-rendered="true"', '');
    }

    update()
    {
        this.vm.$nextTick();

        // this.vm.$nextTick();

        return this;
    }

    dd()
    {
        dd(this.toHtml());
    }

    assertEmitted(eventName)
    {
        this.update();

        let events = this.wrapper.emitted();
        let eventNames = Object.keys(events);

        this.tester.assertTrue(eventNames.includes(eventName), `Assert that event [${eventName}] was emitted, but is was not.`);
    }

    assertSee(expression)
    {
        let rawExpression = expression;

        if (typeof expression == 'string') {
            expression = new RegExp(expression, 'gim');
        }

        let html = this.toHtml();

        this.tester.assertContains(expression, html, `Assert that "${rawExpression}" should exists on the page, but it was not found.`);

        return this;
    }

    andSee(expression)
    {
        return this.assertSee(expression);
    }

    see(expression)
    {
        return this.assertSee(expression);
    }

    assertNotSee(expression)
    {
        let rawExpression = expression;

        if (typeof expression == 'string') {
            expression = new RegExp(expression, 'gim');
        }

        this.tester.assertNotRegExp(expression, this.toHtml(), `Assert that "${rawExpression}" should not exists on the page, but it was found.`);
    }

    andNotSee(expression)
    {
        return this.assertNotSee(expression);
    }

    notSee(expression)
    {
        return this.assertNotSee(expression);
    }

    async assertVisible(text)
    {
        let cheerio = require('cheerio');
        let html = await this.toHtml();
        let $ = cheerio.load(html);

        let isVisible = $('div').filter(function() {
            return $(this).text().trim() === text;
        }).attr('style') != 'display:none;';

        this.tester.assertTrue(isVisible);

        return this;
    }

    async assertNotVisible(text)
    {
        let cheerio = require('cheerio');
        let html = await this.toHtml();
        let $ = cheerio.load(html);

        let isNotVisible = $('div').filter(function() {
            return $(this).text().trim() === text;
        }).attr('style') == 'display:none;';

        this.tester.assertTrue(isNotVisible);

        return this;
    }

    click(selector)
    {
        this.find(selector).trigger('click');
    }

    typeInto(selector, value)
    {
        let elementWrapper = this.find(selector);

        elementWrapper.element.value = value;
        elementWrapper.trigger('input');
    }

    find(selector)
    {
        return this.wrapper.find(selector);
    }
}

let beforeCreate = function()
{
	let $on = this.$on;
	let $emit = this.$emit;

	this.$on = (name, callback) => {
		console.log('Trap $on');
		$on.bind(this)(name, callback);
	};

	this.$emit = (name, payload) => {
		console.log('Trap $emit');
		$emit.bind(this)(name, payload);
	};
}
