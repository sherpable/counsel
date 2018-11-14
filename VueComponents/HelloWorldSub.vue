<template>
    <div>
        <i>{{ greeting }}!</i>
        <hello-world-sub-sub greeting="Sub Sub Component"></hello-world-sub-sub>
    </div>
</template>

<script>
    let HelloWorldSubSub = require('./HelloWorldSubSub.vue');

    module.exports = {
        props: {
            greeting: {
                default: 'Hello Sub World',
            }
        },

        components: {
            'hello-world-sub-sub': HelloWorldSubSub,
        },
    }
</script>

<style scoped>
    p {
        font-size: 2em;
        text-align: center;
    }
</style>
