export interface Rule {
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

export interface IParserState {
    match: any;
    text: string;
    enableTrimSpace: boolean;
}

export class Parser {
    ruleSet: IRuleSet;
    actSet: IActionSet;

    constructor(ruleSet: IRuleSet, actSet: IActionSet) {
        this.ruleSet = Object.assign({}, ruleSet);
        this.actSet = Object.assign({}, actSet);
    }

    run(text: string): any {
        const state: IParserState = {
            match: null,
            text: text,
            enableTrimSpace: true
        };
        this.parse('$begin', state);
        return state.match;
    }

    private parse(rule: Rule, state: IParserState): boolean {
        // RegExp as Token rule.
        if (rule instanceof RegExp) {
            console.log('Token rule: ' + rule);

            if (state.enableTrimSpace) {
                state.enableTrimSpace = false;
                this.parse('$space', state);
                state.enableTrimSpace = true;
            }

            const matches = state.text.match(new RegExp(`^(${(rule as RegExp).source})`));
            if (!matches) {
                return false;
            }
            console.log('-> match: "' + matches[0] + '"');
            state.match = matches[0];
            state.text = state.text.slice(matches[0].length);
            return true;
        }
        // String as Reference rule.
        else if (typeof rule === 'string') {
            console.log('Reference rule: ' + rule);
            const ruleList = this.ruleSet[rule as string];
            const isMatched = this.parse(ruleList, state);

            if (isMatched && this.actSet[rule as string]) {
                state.match = this.actSet[rule as string](state.match);
            }

            return isMatched;
        }
        // Array as Rule list.
        else if (rule instanceof Array) {
            console.log('Rule list: ' + rule);
            const resultList: any[] = [];
            rule.forEach(r => {
                if (!this.parse(r, state)) {
                    return false;
                }
                resultList.push(state.match);
            });
            state.match = resultList;
            return true;
        }

        console.log('Unknown rule: ' + rule);
        return false;
    }
}
