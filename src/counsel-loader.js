let = cheerio = require('cheerio');

module.exports = source => {
	let rawComponent = cheerio.load(source);
	let component = rawComponent('script').html();	
	let template = rawComponent('template').html();

	return component.replace('module.exports = {', 'module.exports = { template: `' + template + '`,');
}
