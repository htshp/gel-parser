import * as assert from 'power-assert';
import { Parser } from '../src/index';

describe('GEL Parser', () => {
    const rules = {
        $begin: [/[0-9]+/],
        $space: [/[ \t\r\n]*/]
    };

    let isExecutedAction = false;
    const actions = {
        $begin: ($: any) => {
            isExecutedAction = true;
            it('Check the expected value of the match result.', () => {
                assert.deepEqual($, ['100']);
            });
            return parseInt($[0]);
        },
        $space: ($: any) => {
            it('Check whether the space could was parsed.', () => {
                assert.deepEqual($, [' \t\r\n']);
            });
            return $;
        }
    };

    it('Check whether the action was executed.', () => {
        assert.ok(isExecutedAction);
    });

    const intParser = new Parser(rules, actions);
    const result = intParser.run(' \t\r\n100');

    it('Confirm whether the parse succeeded.', () => {
        assert.equal(result, 100);
    });
});
