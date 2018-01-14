module.exports = class CountdownTest extends VueComponentTestCase
{
    beforeEach()
    {
        super.beforeEach();

        this.until = moment().add(10, 'seconds');

        this.component = this.render('<countdown :until="until"></countdown>', { until: this.until });
    }

    /** @test */
    it_is_able_to_render_the_countdown_component()
    {
        this.component.assertSee('0 Days');
        this.component.assertSee('0 Hours');
        this.component.assertSee('0 Minutes');
        this.component.assertSee('10 Seconds');
    }

    /** @test */
    it_will_update_the_seconds_proper_after_1_second_and_after_5_seconds()
    {
        this.component.fastForward('1s');

        this.component.assertSee('0 Days');
        this.component.assertSee('0 Hours');
        this.component.assertSee('0 Minutes');
        this.component.assertSee('9 Seconds');

        this.component.fastForward('4s');

        this.component.assertSee('5 Seconds');
    }

    /** @test */
    it_will_show_the_proper_expired_text_after_the_countdown_has_completed()
    {
        this.component.fastForward('10s');

        this.component.assertSee('Now Expired');
    }

    /** @test */
    it_is_possible_to_specify_a_custom_expired_message()
    {
        this.component.setProps({ expiredText: 'Contest is over.' });

        this.component.fastForward('10s');

        this.component.assertSee('Contest is over.');
    }


    /** @test */
    it_will_broadcast_when_the_countdown_has_finished()
    {
        this.component.fastForward('10s');

        this.component.assertEmitted('finished');
    }

    /** @test */
    it_clears_the_interval_once_completed()
    {
        this.component.fastForward('10s');

        this.assertEquals(10, this.component.now.getSeconds());

        this.component.fastForward('5s');

        this.assertEquals(10, this.component.now.getSeconds());
    }
}
