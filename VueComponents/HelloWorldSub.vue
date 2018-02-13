<template>
    <div>
        <i>{{ greeting }}!</i>
        <hello-world-sub-sub greeting="Sub Sub Component"></hello-world-sub-sub>
    </div>
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
