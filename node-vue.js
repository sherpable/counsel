let = cheerio = require('cheerio');

let source = `
<template>
    <p>{{ greeting }} World!</p>
</template>

<script>
    module.exports = {
        data() {
            return {
                greeting: 'Hello',
            };
        },

        mounted()
        {
            console.log('ready!');
        }
    }
</script>

<style scoped>
    p {
        font-size: 2em;
        text-align: center;
    }
</style>
`;

let rawComponent = cheerio.load(source);
let component = rawComponent('script').html();	
let template = rawComponent('template').html();

console.log(
	component.replace('module.exports = {', 'module.exports = { template: `' + template + '`,')
);