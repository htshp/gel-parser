import * as assert from 'power-assert';
import {Parser} from '../src/index';

describe("GEL Parser", ()=>{
    it("RegExp rule test.", ()=>{
        const rules = {
            $begin: [/[0-9]+/]
        };

        const actions = {
            $begin: ($: any)=>{
                assert.deepEqual($, ['100']);
                return parseInt($[0]);
            }
        };

        const intParser = new Parser(rules, actions);

        assert.equal(intParser.run('100'), 100);
    });
});
