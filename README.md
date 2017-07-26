      ／￣￣\
     | o  o |    GEL Parser
    ∠――――┐ノ

Usage        
----

```js
import {Parser} from 'gel-parser';

const rules = {
    $begin: [/[0-9]+/],
    $space: [/[ \t\r\n]/]
};

const actions = {
    $begin: $=>parseInt($[0])
};

const intParser = new Parser(rules, actions);

console.log(intParser.run('100'));
```
