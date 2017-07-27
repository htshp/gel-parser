const { Parser, or } = require('..');

const rules = {
    $begin: 'expr',
    expr: or(
        [{ left: 'int' }, /[\+]/, { right: 'expr' }],
        { atom: 'int' }),
    int: /[0-9]+/
};

const actions = {
    expr: $ => $.left ? $.left + $.right : $.atom,
    int: $ => parseInt($)
};

const calcParser = new Parser(rules, actions);

console.log( '100 + 200 = ' + calcParser.run('100 + 200') );
