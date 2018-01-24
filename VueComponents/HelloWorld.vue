<template>
    <div>
        <p>{{ greeting }}!</p>
        <hello-world-sub></hello-world-sub>
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

        components: [
            HelloWorldSub
        ],
    }
</script>

<style scoped>
    p {
        font-size: 2em;
        text-align: center;
    }
</style>
