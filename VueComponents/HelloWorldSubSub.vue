<template>
    <small>{{ greeting }}!<hello-world-sub-sub-sub></hello-world-sub-sub-sub></small>
</template>

<script>
    let HelloWorldSubSubSub = require('./HelloWorldSubSubSub.vue');

    module.exports = {
        props: {
            greeting: {
                default: 'Hello Sub Sub World',
            }
        },

        components: {
            'hello-world-sub-sub-sub': HelloWorldSubSubSub,
        },
    }
</script>

<style scoped>
    small {
        color: red;
    }
</style>
