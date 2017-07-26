import * as assert from 'power-assert';
import { Parser } from '../src/index';
import { or } from '../src/logicalRule';

describe('GEL Parser', () => {
    context('Basic Test', () => {
        const rules = {
            $begin: or(
                {a: 'int'}, 
                {b: 'alphabet'}),
            int: /[0-9]+/,
            alphabet: /[a-zA-Z]+/
        };

        const parser = new Parser(rules, {});

        it('Match only one rule.', () => {
            const result = parser.run('100');
            assert.strictEqual(result.a, '100');
            assert.strictEqual(result.b, undefined);

            const result2 = parser.run('abc');
            assert.strictEqual(result2.a, undefined);
            assert.strictEqual(result2.b, 'abc');
        });
    });

    context('Action test.', () => {
        const rules = {
            $begin:  /[0-9]+/
        };

        let isExecutedAction = false;
        const actions = {
            $begin: ($: any) => {
                isExecutedAction = true;
                it('Check the expected value of the match result.', () => {
                    assert.strictEqual($, '100');
                });
                return parseInt($);
            }
        };

        const intParser = new Parser(rules, actions);
        const result = intParser.run('100');

        it('Check whether the action was executed.', () => {
            assert.ok(isExecutedAction);
        });
    });

    context('$space test.', () => {
        const rules = {
            $begin: /[0-9]+/
        };
        const actions = {
            $space: ($: any) => {
                it('Check whether the space could was parsed.', () => {
                    assert.strictEqual($, ' \t\r\n');
                });
                return $;
            }
        };

        const result = new Parser(rules, actions).run(' \t\r\n123');

        it('$space is working.', () => {
            assert.strictEqual(result, '123');
        });

        it('rules are not destroyed.', () => {
            assert.strictEqual((rules as any).$space, undefined);
        });
    });

    context('Logging test.', () => {
        const parser = new Parser({ $begin: /./ }, {});

        let buffer = '';
        function log(message: string){
            buffer += message;
        }

        it('Supressed log.', () => {
            buffer = '';
            parser.run('test', {
                verbose: false,
                logFunc: log
            });
            assert.ok(buffer === '');
        });

        it('Output log.', () => {
            buffer = '';
            parser.run('test', {
                verbose: true,
                logFunc: log
            });
            assert.ok(buffer !== '');
        });
    });

    context('Tagged rule test.', () => {
        const rules = {
            $begin:  {a: /hello/}
        };

        const actions = {
            $begin: $ => {
                it('Match results can be obtained by tag specification.', () => {
                    assert.strictEqual($.a, 'hello');
                    return $;
                });
            }
        };

        new Parser(rules, actions).run('hello');
    });
});
