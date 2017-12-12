let Spider =require("../Spider");
let mysql = require("mysql");
let db = require("../db/DB");
let spi = Spider("People");
let util = require("../utils/util");
async function go(){
    var count = 0;
    try{
        let index = await spi.index();
        console.log("INDEX================="+index)
        let focusUrls = [],
                cities = [],
                ports =[];
            cities = index.city;
            ports = index.portList;
        for(let i=0 ;i< index.focusList.length;i++){
            focusUrls.push(index.focusList[i].url);
        }
        for( let i = 0 ; i< focusUrls.length ; i++){
            // console.log("=====================")
            let result = await spi.adapter(focusUrls[i]);
            let title = await util.titleEscape(result.title);
            let content =await util.contentEscape(result.content);
            await db.query(`insert into art (title,content) value(${title},${content})`);
            count ++;
            console.log(`--------------------->>>>>>>> ${count} pages`);
        }
    }catch(e){
        console.log(e);
    }
}
go();