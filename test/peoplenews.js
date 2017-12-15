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
                await db.query(`insert into arc (title,content) value(${title},${content})`);
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
                let sub = await util.titleEscape(result.subTitle);
                let pre = await util.titleEscape(result.preTitle);
                let picUrls = result.imgUrls;
                let content =await util.contentEscape(result.content);
                let urls = result.urls;
                picUrls = mysql.escape(util.checkExist(picUrls));
                picUrls = picUrls.toString().replace(/,/g," ");
                if(urls != undefined){
                    for(let i=0;i<urls.length;i++){
                        let tempUrl =await spi.singlePicUrl(urls[i]);
                        picUrls+=tempUrl+" ";
                    }
                }
                picUrls = mysql.escape(picUrls);
                sub = mysql.escape(util.checkExist(sub));
                pre = mysql.escape(util.checkExist(pre));
                if(title != undefined && content != undefined)
                    await db.query(`insert into arc (title,content,preTitle,subTitle,imgUrls) value(${title},${content},${pre},${sub},${picUrls})`);
                count ++;
                console.log(`--------------------->>>>>>>> ${count} pages`);
            }
        }
    }catch(e){
        console.log(e);
    }
}
go();
