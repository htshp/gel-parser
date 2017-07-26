import * as assert from 'power-assert';
import { Parser } from '../src/index';

describe('GEL Parser', () => {
    context('Basic Test', () => {
        const rules = {
            $begin:  ['binExpr'],
            binExpr: [{left: 'atom'}, /[+]/, {right: 'atom'}],
            atom:    [/[0-9]+/]
        };

        const actions = {
            binExpr: ($: any) => {
                return $.left + $.right;
            },
            atom: ($: any) => parseInt($[0])
        };

        const intParser = new Parser(rules, actions);
        const result = intParser.run(' 100 + 123');

        it('Confirm whether the parse succeeded.', () => {
            assert.strictEqual(result[0], 223);
        });
    });

    context('Action test.', () => {
        const rules = {
            $begin:  [/[0-9]+/]
        };

        let isExecutedAction = false;
        const actions = {
            $begin: ($: any) => {
                isExecutedAction = true;
                it('Check the expected value of the match result.', () => {
                    assert.strictEqual($[0], '100');
                });
                return parseInt($[0]);
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
            $begin: [/[0-9]+/]
        };
        const actions = {
            $space: ($: any) => {
                it('Check whether the space could was parsed.', () => {
                    assert.strictEqual($[0], ' \t\r\n');
                });
                return $;
            }
        };

        const result = new Parser(rules, actions).run(' \t\r\n123');

        it('$space is working.', () => {
            assert.strictEqual(result[0], '123');
        });

        it('rules are not destroyed.', () => {
            assert.strictEqual((rules as any).$space, undefined);
        });
    });

    context('Logging test.', () => {
        const parser = new Parser({ $begin: [/./] }, {});

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
});
