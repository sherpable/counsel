<template>
    <p>{{ greeting }}!</p>
</template>

<script>
    module.exports = {
        props: {
            greeting: {
                default: 'Hello World',
            }
        },
    }
</script>

<style scoped>
    p {
        font-size: 2em;
        text-align: center;
    }
</style>
