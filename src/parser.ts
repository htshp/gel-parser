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

export interface IParserState{
    match: any;
    text: string;
}

export class Parser{
    constructor(private ruleSet: IRuleSet, private actSet: IActionSet){
        
    }

    run(text: string): any{
        const state: IParserState = {
            match: null,
            text: text
        };
        this.parse('$begin', state);
        return state.match;
    }

    private parse(rule: Rule, state: IParserState):boolean{
        // RegExp as Token rule.
        if(rule instanceof RegExp){
            const matches = state.text.match(new RegExp(`^(${rule as RegExp})`));
            if(!matches){
                return false;
            }
            state.match = matches[0];
            state.text = state.text.slice(matches[0].length, -1);
            return true;
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