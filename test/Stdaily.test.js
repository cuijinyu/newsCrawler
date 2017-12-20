/**
 * Created by 崔晋瑜 on 2017/12/20.
 */
const assert = require("assert");
const expect = require("chai").expect;
describe("a+b",function(){
    it("a+b应该等于a+b",function(){
        expect(abc(1,1)).to.be.equal(2);
    })
})
function abc(a,b) {
    return a+b;
}