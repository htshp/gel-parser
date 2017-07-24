import * as assert from 'power-assert';
import * as mytest from '../src/index';

describe("Sample test.", ()=>{
    context("mytest.i", ()=>{
        it("i is 100.", ()=>{
            assert.equal(mytest.i, 100);
        });
    });
});
