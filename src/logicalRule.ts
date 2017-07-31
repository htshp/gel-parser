import { TopLevelRule } from './parser';

export type ILogicalRule = IOrRule | ITimeRule;

export type LogicalRuleFunc = () => ILogicalRule;

export interface IOrRule {
    type: 'or';
    rules: TopLevelRule[];
}

export function or(...rules: TopLevelRule[]): LogicalRuleFunc {
    return () => ({
        type: 'or',
        rules: rules
    });
}

export interface ITimeRule {
    type: 'time';
    rule: TopLevelRule;
    count: number | {start?: number, end?: number};
}

export function time(rule: TopLevelRule, count: number | {start?: number, end?: number}): LogicalRuleFunc {
    return () => ({
        type: 'time',
        rule: rule,
        count: count
    });
}
