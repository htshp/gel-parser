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
    from: number;
    to: number;
}

/**
 * time(r)        : 0 or more.
 * time(r, 3)     : 3 or more.
 * time(r, -5)    : 5 or less.
 * time(r, 2, -4) : 2 or more and 4 or less.
 * time(r, 4, -4) : Just 4 times.
 */
export function time(rule: TopLevelRule, from?: number, to?: number): LogicalRuleFunc {
    return () => ({
        type: 'time',
        rule: rule,
        from: from,
        to: to
    });
}
