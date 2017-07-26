import { TopLevelRule } from './parser';

export interface ILogicalRule{
    type: 'or';
    value: any;   
}

export type LogicalRuleFunc = ()=>ILogicalRule;

export function or(...rules: TopLevelRule[]): LogicalRuleFunc{
    const ret: ILogicalRule = {
        type: 'or',
        value: rules
    };

    return () => {
        return ret;
    };
}
