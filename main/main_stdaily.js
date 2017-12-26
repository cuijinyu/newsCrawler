/**
 * Created by 崔晋瑜 on 2017/12/24.
 */
var spider = require("../Spider");
var spi = spider("Stdaily");
var util = require("../utils/util");
(async function () {
    try {
        let articles = [];
        let news = await spi.news();
        let science = await spi.science()
         let ai = await spi.ai();
         let people = await spi.people();
            news = news.concat(science, ai);
            articles = news.concat(people);
        await util.sleep(5000);
        console.log("=================>BEGIN<==============");
        for(let i = 0;i<articles.length;i++){
            console.log(`----------${articles[i].url}-------------`)
            try{
                let content = await spi.page(articles[i].url);
            }catch (e){
                console.log(e);
            }
            console.log(`-------------------------------------------->${i} pages`);
            await util.sleep(2000);
        }
    }catch(e){
        console.log(e);
    }
})()