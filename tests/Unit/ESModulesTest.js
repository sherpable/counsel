counsel_use('TestCase');

import ESModule from '../ESModule';
import { sum, avg } from '../ESMath';

module.exports = class ESModulesTest extends TestCase
{
    /** @test */
    es_module_import()
    {
        let es = new ESModule;
        
        this.assertEquals(es.say(), 'ES Module');

        this.assertEquals(sum(1, 1), 2);

        this.assertEquals(avg(2, 4), 3);
    }
}