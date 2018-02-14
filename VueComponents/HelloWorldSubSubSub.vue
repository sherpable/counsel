<template>
    <em>{{ greeting }}!</em>
</template>

<script>
    module.exports = {
        props: {
            greeting: {
                default: 'Hello Sub Sub Sub World',
            }
        },
    }
</script>

<style scoped>
    small {
        color: green;
    }
</style>
