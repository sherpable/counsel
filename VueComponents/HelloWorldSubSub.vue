<template>
    <small>{{ greeting }}!</small>
</template>

<script>
    module.exports = {
        props: {
            greeting: {
                default: 'Hello Sub Sub World',
            }
        },
    }
</script>

<style scoped>
    small {
        color: red;
    }
</style>
