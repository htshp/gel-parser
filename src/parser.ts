import * as _ from 'lodash';
import { LogicalRuleFunc, ILogicalRule } from './logicalRule';

export type RuleAtom = string | RegExp | {[tag: string]: TopLevelRule;} | LogicalRuleFunc;

export interface Rule {
    [index: number]: RuleAtom;
}

export type TopLevelRule = Rule | RuleAtom;

export interface IRuleSet {
    $begin: TopLevelRule;
    [ruleName: string]: TopLevelRule;
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
    taggedMatch: {[tagName: string]: any};

    // For debug.
    lastText?: string;
}

export interface IParserOption{
    verbose?: boolean;
    logFunc?: (message: string)=>void;
}

export class Parser {
    private ruleSet: IRuleSet;
    private actSet: IActionSet;
    private option: IParserOption;

    constructor(ruleSet: IRuleSet, actSet: IActionSet) {
        this.ruleSet = _.cloneDeep(ruleSet);
        this.actSet = _.cloneDeep(actSet);

        // If $space is omitted, the default $space is set.
        if (!this.ruleSet.$space) {
            this.ruleSet.$space = /[ \t\r\n]*/;
        }
    }

    run(text: string, option?: IParserOption): any {
        const state: IParserState = {
            match: null,
            text: text,
            enableTrimSpace: true,
            taggedMatch: {},
            lastText: ''
        };

        const DEFAULT_OPTION: IParserOption = {
            verbose: false,
            logFunc: console.log
        };
        this.option = Object.assign(DEFAULT_OPTION, option);

        this.parse('$begin', state);
        return state.match;
    }

    private parse(rule: TopLevelRule, state: IParserState): boolean {
        if(state.lastText !== state.text){
            this.log(`[TEXT CHANGED] "${state.lastText}" => "${state.text}"`);
            state.lastText = state.text;
        }
        
        // RegExp as Token rule.
        if (rule instanceof RegExp) {
            this.log('[RULE] Token: ' + rule);

            if (state.enableTrimSpace) {
                state.enableTrimSpace = false;
                this.parse('$space', state);
                state.enableTrimSpace = true;
            }

            const matches = state.text.match(new RegExp(`^(${(rule as RegExp).source})`));
            if (!matches) {
                this.log('-> failed Token : ' + rule);
                return false;
            }
            this.log('-> match: "' + matches[0] + '"');
            state.match = matches[0];
            state.text = state.text.slice(matches[0].length);
            return true;
        }
        // String as Reference rule.
        else if (typeof rule === 'string') {
            this.log('[RULE] Reference: ' + rule);
            const backupTaggedMatch = state.taggedMatch;
            state.taggedMatch = {};
            const ruleList = this.ruleSet[rule as string];
            const isMatched = this.parse(ruleList, state);

            if(isMatched){
                if(Object.keys(state.taggedMatch).length > 0){
                    state.match = Object.assign({}, state.match, state.taggedMatch);
                }
                if (this.actSet[rule as string]) {
                    state.match = this.actSet[rule as string](state.match);
                }
            }

            state.taggedMatch = backupTaggedMatch;
            return isMatched;
        }
        // Array as Rule list.
        else if (rule instanceof Array) {
            this.log('[RULE] List: ' + rule);
            const resultList: any[] = [];
            for(const i in rule){
                const r = rule[i];
                if (!this.parse(r, state)) {
                    return false;
                }
                resultList.push(state.match);
            }
            state.match = resultList;
            return true;
        }
        // Object as tagged rule.
        else if (rule instanceof Object && Object.keys(rule).length === 1) {
            const tag = Object.keys(rule)[0];
            const taggedRule = (rule as any)[tag];
            this.log(`[RULE] Tagged: {${tag}: ${taggedRule}}`);

            if (!this.parse(taggedRule, state)) {
                return false;
            }

            state.taggedMatch[tag] = state.match;
            return true;
        }
        // Function as Logical rule.
        if (rule instanceof Function) {
            const logicalRule: ILogicalRule = (rule as Function)();

            switch(logicalRule.type){
                case 'or':
                    const rules: TopLevelRule[] = logicalRule.value;
                    this.log('[RULE] or: ' + rules);

                    for(const i in rules){
                        const backupState = _.cloneDeep(state);
                        if( this.parse(rules[i], state) ){
                            return true;
                        }else{
                            // Fallback text and taggedMatch.
                            state.text = backupState.text;
                            state.taggedMatch = backupState.taggedMatch;
                        }
                    }

                    return false;
            }
        }

        this.log('Unknown rule: ' + rule);
        return false;
    }

    private log(message: string){
        if(this.option.verbose){
            this.option.logFunc(message);
        }
    }
}
