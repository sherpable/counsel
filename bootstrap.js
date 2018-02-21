window.Vue = require('vue');
window.moment = require('moment');

Vue.component('hello-world', {
    template: `
        <div :class="color">
            <h1 v-show="title">{{ title }}</h1>
            <button @click="changeTextFromButton">Change text</button>
            <input v-model="title">
            {{ text }}
        </div>`,

    props: ['color'],

    data() {
        return {
            text: 'Hello World',
            title: null,
        }
    },

    methods: {
        changeText(text) {
            if (text == 'Bad text') {
                return;
            }

            this.text = text;
        },

        changeTextFromButton() {
            this.changeText('From button');
        }
    }
});

Vue.component('single-slot', {
    template: `
        <div>
            <slot></slot>
        </div>`,
});

Vue.component('named-slot', {
    template: `
        <div>
            <header>
                <slot name="header"></slot>
            </header>
            <main>
                <slot></slot>
            </main>
            <footer>
                <slot name="footer"></slot>
            </footer>
        </div>`,
});

Vue.component('named-slot-with-nested-main-slot', {
    template: `
        <div>
            <header>
                <slot name="header"></slot>
            </header>
            <main>
                <div>
                    <slot></slot>
                </div>
            </main>
            <footer>
                <slot name="footer"></slot>
            </footer>
        </div>`,
});

Vue.component('todo-list', {
    template: `
        <ul>
            <li v-for="item in items" v-text="item"></li>
        </ul>`,

    props: ['items'],
});

Vue.component('menu-item', {
    template: `
        <li></li>
    `,
});

Vue.component('menu', {
    template: `
        <ul>
            <menu-item v-for="item in items" :key="item" v-text="item"></menu-item>
        </ul>
    `,

    props: ['items'],

    methods: {
        setItems(items)
        {
            this.items = items;
        }
    }
});

Vue.component('countdown', {
    template: `
        <div>
            <div v-if="! finished">
                <span>{{ remaining.days() }} Days, </span>
                <span>{{ remaining.hours() }} Hours, </span>
                <span>{{ remaining.minutes() }} Minutes, </span>
                <span>{{ remaining.seconds() }} Seconds </span>
                left...
            </div>

            <div v-else v-text="expiredText"></div>
        </div>
    `,

    props: {
        until: null,
        expiredText: { default: 'Now Expired' }
    },

    data()
    {
        return {
            now: new Date(),
            interval: null
        };
    },

    computed: {
        finished()
        {
            return this.remaining <= 0;
        },

        remaining()
        {
            let remaining = moment.duration(Date.parse(this.until) - this.now);
            if (remaining <= 0) {
                this.$emit('finished');
            }
            return remaining;
        }
    },

    created()
    {
        this.interval = setInterval(() => {
            this.now = new Date();
        }, 1000);

        this.$on('finished', () => clearInterval(this.interval));
    },

    destroyed()
    {
        clearInterval(this.interval);
    }
});

Vue.component('view-presentation', {
    template: `<div><slot></slot></div>`,
});

Vue.component('app-layout', {
    template: `
        <div>
            <section class="hero is-primary is-bold">
                <div class="hero-body">
                    <div class="container">
                        <h1 class="title">
                            <slot name="title">{{ title }}</slot>
                        </h1>
                        <h2 class="subtitle">
                            <slot name="slogan">{{ slogan }}</slot>
                        </h2>
                    </div>
                </div>
            </section>

            <div class="container">

                <slot name="nav">
                    <n-nav></n-nav>
                </slot>

                <slot></slot>

                <footer-layout></footer-layout>
            </div>
        </div>
    `,
});