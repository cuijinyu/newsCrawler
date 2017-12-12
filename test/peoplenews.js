let Spider =require("../Spider");
let mysql = require("mysql");
let db = require("../db/DB");
let spi = Spider("People");
let util = require("../utils/util");
async function go(){
    var count = 0;
    try{
        let index = await spi.index();
        let focusUrls = [],
            cities = [],
            ports =[];
        cities = index.city;
        ports = index.portList;
        console.log("CITIES:++++++"+cities[0].url);
        for(let i=0 ;i< index.focusList.length;i++){
            focusUrls.push(index.focusList[i].url);
        }
        for( let i = 0 ; i< focusUrls.length ; i++){
            let result = await spi.adapter(focusUrls[i]);
            // console.log(result);
            if(result.type){
                break;
            }
            if(result.title == undefined || result.content == undefined){
                break;
            }
            let title = await util.titleEscape(result.title);
            let content =await util.contentEscape(result.content);
            if(title != undefined && content != undefined){
                await db.query(`insert into article (title,content) value(${title},${content})`);
            }
            count ++;
            console.log(`--------------------->>>>>>>> ${count} pages`);
        }
        for(let i=0;i<cities.length;i++){
            console.log(cities[i].url);
            focusUrls = await spi.homePage(cities[i].url);
            focusUrls = await util.testAll(focusUrls,cities[i].url);
            for( let j = 0 ; j< focusUrls.length ; j++){
                let result = await spi.adapter(focusUrls[j].url);
                let title = await util.titleEscape(result.title);
                let content =await util.contentEscape(result.content);
                if(title != undefined && content != undefined)
                    await db.query(`insert into article (title,content) value(${title},${content})`);
                count ++;
                console.log(`--------------------->>>>>>>> ${count} pages`);
            }
        }
    }catch(e){
        console.log(e);
    }
}
go();
