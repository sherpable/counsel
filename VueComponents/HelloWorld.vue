<template>
    <div>
        <p>{{ greeting }}!</p>
        <hello-world-sub></hello-world-sub>
        <foo></foo>
    </div>
</template>

<script>
    let HelloWorldSub = require('./HelloWorldSub.vue');

    module.exports = {
        props: {
            greeting: {
                default: 'Hello World',
            }
        },

        components: {
            'hello-world-sub': HelloWorldSub,
        },
    }
</script>

<style scoped>
    p {
        font-size: 2em;
        text-align: center;
    }
</style>
