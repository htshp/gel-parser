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

        const s = { state: state };

        const DEFAULT_OPTION: IParserOption = {
            verbose: false,
            logFunc: console.log
        };
        this.option = Object.assign(DEFAULT_OPTION, option);

        this.parse('$begin', s);
        return s.state.match;
    }

    private parse(rule: TopLevelRule, s: {state: IParserState}): boolean {
        if(s.state.lastText !== s.state.text){
            this.log(`[TEXT CHANGED] "${s.state.lastText}" => "${s.state.text}"`);
            s.state.lastText = s.state.text;
        }
        
        // RegExp as Token rule.
        if (rule instanceof RegExp) {
            this.log('[RULE] Token: ' + rule);

            if (s.state.enableTrimSpace) {
                s.state.enableTrimSpace = false;
                this.parse('$space', s);
                s.state.enableTrimSpace = true;
            }

            const matches = s.state.text.match(new RegExp(`^(${(rule as RegExp).source})`));
            if (!matches) {
                this.log('-> failed Token : ' + rule);
                return false;
            }
            this.log('-> match: "' + matches[0] + '"');
            s.state.match = matches[0];
            s.state.text = s.state.text.slice(matches[0].length);
            return true;
        }
        // String as Reference rule.
        else if (typeof rule === 'string') {
            this.log('[RULE] Reference: ' + rule);
            const backupTaggedMatch = s.state.taggedMatch;
            s.state.taggedMatch = {};
            const ruleList = this.ruleSet[rule as string];
            const isMatched = this.parse(ruleList, s);

            if(isMatched){
                if(Object.keys(s.state.taggedMatch).length > 0){
                    s.state.match = Object.assign(s.state.match, s.state.taggedMatch);
                }
                if (this.actSet[rule as string]) {
                    s.state.match = this.actSet[rule as string](s.state.match);
                }
            }

            s.state.taggedMatch = backupTaggedMatch;
            return isMatched;
        }
        // Array as Rule list.
        else if (rule instanceof Array) {
            this.log('[RULE] List: ' + rule);
            const backupState = _.cloneDeep(s.state);

            const resultList: any[] = [];
            for(const i in rule){
                const r = rule[i];
                if (!this.parse(r, s)) {
                    s.state = backupState;
                    return false;
                }
                resultList.push(s.state.match);
            }
            s.state.match = resultList;
            return true;
        }
        // Object as tagged rule.
        else if (rule instanceof Object && Object.keys(rule).length === 1) {
            const tag = Object.keys(rule)[0];
            const taggedRule = (rule as any)[tag];
            this.log(`[RULE] Tagged: {${tag}: ${taggedRule}}`);

            const backupTagged = s.state.taggedMatch;
            s.state.taggedMatch = {};
            if (!this.parse(taggedRule, s)) {
                s.state.taggedMatch = backupTagged;
                return false;
            }
            backupTagged[tag] = Object.assign( s.state.match, s.state.taggedMatch );
            s.state.taggedMatch = backupTagged;
            
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
                        if( this.parse(rules[i], s) ){
                            return true;
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
