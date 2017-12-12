
let people = require("./spiders/People")
        // xinhua   = require("./spiders/xinhua");
/**
 *
 * @param type
 * @returns {Spider}
 * @constructor
 */
let Spider = function (type) {
    if(this instanceof  Spider){
        let s = new this[type]();
        return s;
    }else{
        return new Spider(type);
    }
}
Spider.prototype = {
    People:people,
    // Xinhua:xinhua
}
module.exports = Spider;