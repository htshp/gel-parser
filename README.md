      ／￣￣\
     | o  o |    GEL Parser
    ∠――――┐ノ

Usage        
----

```js
import {Parser} from 'gel-parser';

const rules = {
    $begin:  ['binExpr'],
    binExpr: [{left: 'atom'}, /[+]/, {right: 'atom'}],
    atom:    [/[0-9]+/]
};

const actions = {
    binExpr: $=>$.left + $.right,
    atom:    $=>parseInt($[0])
};

const intParser = new Parser(rules, actions);

console.log(intParser.run('100 + 123'));
```

Roadmap
----

- [x] Toplevel single rule.
  - ex) $begin: 'expr'
- [x] 'or' rule.
- [ ] Calculator sample.
- [ ] DSL sample.
- [ ] Nest tag rule. 
- [ ] Backtracking.
- [ ] Error check.
- [ ] 'time' rule.
- [ ] Support left recursive.
- [ ] 'option' rule.
- [ ] Better test.
