import { Parser } from './parser';
export { Parser } from './parser';

const rules = {
            $begin: [/[0-9]+/]
        };

        const actions = {
            $begin: ($: any)=>{
                return parseInt($[0]);
            }
        };

        const intParser = new Parser(rules, actions);

        console.log(intParser.run('100'));
