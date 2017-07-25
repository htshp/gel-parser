export interface Rule{
    [index: number]: string | RegExp;
}

export interface IRuleSet {
    $begin: Rule;
    [ruleName: string]: Rule;
}

export interface IParseResult {
    [tagName: string]: string | any;
    [index: number]: string | any;
}

export type Action = ($: IParseResult) => any;

export interface IActionSet {
    [ruleName: string]: Action;
}

export class Parser{
    constructor(private ruleSet: IRuleSet, private actSet: IActionSet){
        
    }

    run(text: string): any{
        return this.parse('$begin');
    }

    private parse(rule: Rule):boolean{
        // RegExp as Token rule.
        if(rule instanceof RegExp){
        }
        // String as Reference rule.
        else if(rule instanceof String){
            const ruleList = this.ruleSet[rule as string];
            ruleList.forEach(element => {
                
            });
        }
        // Array as rule list.
        else if(rule instanceof Array){
            const resultList: any[] = [];
            rule.forEach(r=>{
                if(this.step(r, isSkipTrim$space)){
                    return false;
                }
                resultList.push(this.result);
            });
            this.result = resultList;
            return true;
        }
    }
}