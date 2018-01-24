<template>
    <i>{{ greeting }}!</i>
</template>

<script>
    module.exports = {
        props: {
            greeting: {
                default: 'Hello Sub World',
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
