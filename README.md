      ／￣￣\
     | o  o |    GEL Parser
    ∠――――┐ノ

Usage        
----

```js
import {Parser} from 'gel-parser';

const rules = {
    $begin:  'binExpr',
    binExpr: [{left: 'atom'}, /[+]/, {right: 'atom'}],
    atom:    /[0-9]+/
};

const actions = {
    binExpr: $=>$.left + $.right,
    atom:    $=>parseInt($)
};

const intParser = new Parser(rules, actions);

console.log(intParser.run('100 + 123'));
```

Roadmap
----

- [x] Toplevel single rule.
  - ex) $begin: 'expr'
- [x] 'or' rule.
- [x] Calculator sample.
- [ ] DSL sample.
- [x] Nest tag rule. 
- [ ] Backtracking.
- [ ] Error check.
- [x] 'time' rule.
- [ ] Support left recursive.
- [ ] 'option' rule.
- [ ] Better test.

Known issues
----

- The Match result of native type be wrap boxxing.
  - 'a' -> new String('a')
- Not assume that null or undefined will be returned in the match result.
