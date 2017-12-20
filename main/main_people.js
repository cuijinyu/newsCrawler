/**
 * Created by 崔晋瑜 on 2017/12/14.
 */
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
            ports =[
                {
                    name:"政治",
                    url:"http://politics.people.com.cn/"
                },
                {
                    name:"国际",
                    url:"http://world.people.com.cn/"
                },
                {
                    name:"台湾",
                    url:"http://tw.people.com.cn/"
                },
                {
                    name:"法制",
                    url:"http://legal.people.com.cn/"
                },
                {
                    name:"社会",
                    url:"http://society.people.com.cn/"
                },
                {
                    name:"港澳",
                    url:"http://hm.people.com.cn/"
                },
                {
                    name:"环保",
                    url:"http://env.people.com.cn/"
                },
                {
                    name:"能源",
                    url:"http://energy.people.com.cn/"
                },
                {
                    name:"科技",
                    url:"http://scitech.people.com.cn/"
                },
                {
                    name:"体育",
                    url:"http://sports.people.com.cn/"
                },{
                    name:"游戏",
                    url:"http://game.people.com.cn/"
                }];
        cities = index.city;
        // ports = index.port;
        console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!
        ${ports}
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
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
        for(let i=0;i<ports.length;i++){
            if(/fangtan/i.exec(ports[i].url)){
                continue;
            }
            let topic = mysql.escape(ports[i].name);
            console.log(ports[i].url);
            focusUrls = await spi.homePage(ports[i].url);
            focusUrls = await util.testAll(focusUrls,ports[i].url);
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
                    await db.query(`insert into arc (title,content,preTitle,subTitle,imgUrls,topic) value(${title},${content},${pre},${sub},${picUrls},${topic})`);
                count ++;
                console.log(`--------------------->>>>>>>> ${count} pages`);
            }
        }
    }catch(e){
        console.log(e);
    }
}
go();
