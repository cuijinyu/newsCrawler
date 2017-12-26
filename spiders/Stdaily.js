/**
 * Created by 崔晋瑜 on 2017/12/19.
 */
let cheerio=require('cheerio') ;
let superagent = require("superagent");
let request = require("superagent-charset")(superagent);
let mysql = require("mysql");
const _ = require("underscore");
const Url = require("url");
let db = require("../db/DB");
let util = require("../utils/util");
class Stdaily{
    constructor(){

    }
    /**
     * 首页
     * @param url
     * @returns {Promise}
     */
    index(url){
        return new Promise((resolve,reject)=>{
            (async ()=>{
                let text = await util.getPage("http://www.stdaily.com/");
                let $ = cheerio.load(text);
            })()
        })
    }

    /**
     * 新闻频道
     * @returns {Promise}
     */
    news(){
        return new Promise((resolve,reject)=>{
                (async ()=>{
                    try{
                        let text = await util.getPage("http://www.stdaily.com/cxzg80/index.shtml");
                        let $ = cheerio.load(text);
                        let a1 = $(".f_yw ul li a"),
                            a2 = $(".mt30 a"),
                            a3 = $(".fp_subtitle a"),
                            a4 = $();
                        console.log(a1);
                        a1 = a1.toArray();
                        a2 = a2.toArray();
                        a3 = a3.toArray();
                        let articles = [];
                         a1 = a1.concat(a2);
                         a1 = a1.concat(a3);
                        for(let i = 0 ;i <a1.length;i++){
                            let title = $(a1[i]).text(),
                                url = util.urlTest($(a1[i]).attr("href"),"http://www.stdaily.com"),
                                topic = "新闻";
                            let temp = {title,url,topic};
                            articles.push(temp);
                        }
                        articles = _.uniq(articles)
                        console.log(articles);
                        resolve(articles);
                    }catch(err){
                        console.log(err);
                        reject(err);
                    }
                })()
        })
    }

    /**
     * AI频道
     * @returns {Promise}
     */
    ai(){
        return new Promise((resolve,reject)=>{
            (async ()=>{
                try{
                    let text = await util.getPage("http://www.stdaily.com/rgzn/aitou/cxzg_list.shtml");
                    for(let i = 2;i<20;i++){
                        text += await util.getPage(`http://www.stdaily.com/rgzn/aitou/cxzg_list_${i}.shtml`)
                    }
                    text += await util.getPage(`http://www.stdaily.com/rgzn/tuijianq/cxzg_list.shtml`);
                    for(let i = 2;i<20;i++){
                        text += await util.getPage(`http://www.stdaily.com/rgzn/tuijianq/cxzg_list_${i}.shtml`)
                    }
                    text += await util.getPage("http://www.stdaily.com/rgzn/AIcy/cxzg_list.shtml");
                    for(let i = 2;i<20;i++){
                        text += await util.getPage(`http://www.stdaily.com/rgzn/AIcy/cxzg_list_${i}.shtml`)
                    }
                    let $ = cheerio.load(text);
                    let urlList = $(".f_lieb_list h3");
                    let articles = [];
                    for(let i=0;i<urlList.length;i++){
                        let title = $(urlList[i]).text(),
                            url = $(urlList[i]).children().attr("href");
                        let topic = "AI";
                        url = util.urlTest(url,"http://www.stdaily.com/");
                        let temp = {title,url,topic};
                        articles.push(temp);
                    }
                    resolve(articles);
                }
                catch (e){
                    console.log(e);
                    reject(e);
                }
            })()
        })
    }

    /**
     * 科幻频道
     * @returns {Promise}
     */
    science(){
        return new Promise((resolve,reject)=>{
            (async ()=>{
                try{
                    let text =await util.getPage("http://www.stdaily.com/kh/khpd/qykjxww.shtml");
                    text +=await util.getPage("http://www.stdaily.com/kh/khpd/khxs.shtml");
                    text +=await util.getPage("http://www.stdaily.com/kh/khpd/khwz.shtml");
                    text +=await util.getPage("http://www.stdaily.com/kh/khpd/dycfbd.shtml");
                    let $ = cheerio.load(text);
                    let urlList = $(".f_lieb_list h3");
                    let articles = [];
                    for(let i=0;i<urlList.length;i++){
                        let title = $(urlList[i]).text(),
                            url = $(urlList[i]).children().attr("href"),
                            topic = "科技";
                        url = util.urlTest(url,"http://www.stdaily.com/");
                        let temp = {title,url,topic};
                        articles.push(temp);
                    }
                    resolve(articles);
                }catch (e){
                    console.log(e);
                    reject(e);
                }
            })()
        })
    }

    /**
     * 获取人物访谈
     * @returns {Promise}
     */
    people(){
        return new Promise((resolve,reject)=>{
                (async ()=>{
                    try{
                        let text = await util.getPage("http://www.stdaily.com/index/fangtan/fangtan.shtml");
                        for(let i = 2;i<20;i++){
                            text += await util.getPage(`http://www.stdaily.com/index/fangtan/fangtan_${i}.shtml`)
                        }
                        let $ = cheerio.load(text);
                        let urlList = $(".f_lieb_list h3");
                        let articles = [];
                        for(let i=0;i<urlList.length;i++){
                            let title = $(urlList[i]).text(),
                                url = $(urlList[i]).children().attr("href"),
                                topic = "访谈";
                            url = util.urlTest(url,"http://www.stdaily.com/");
                            let temp = {title,url,topic};
                            articles.push(temp);
                        }
                        resolve(articles);
                    }
                    catch (e){
                        console.log(e);
                        reject(e);
                    }
                })()
        })
    }

    /**
     *获得分栏目下的页面
     * @param url
     * @returns {Promise}
     */
    page(url){
        return new Promise((resolve,reject)=>{
                (async ()=>{
                    try{
                        let data = await util.getPage(url);
                        // console.log(data.text);
                        let $ = cheerio.load(data);
                        let title = $(".aticleHead h1").text();
                        let time = $(".time").text().trim().slice(0,19);
                        let content = $(".content").text();
                        let pics = $(".content img"),
                            picUrls = [];
                        for(let i=0;i<pics.length;i++){
                            picUrls.push(util.urlTest($(pics[i]).attr("src"),"http://www.stdaily.com"));
                        }
                        let row = {title,time,content,picUrls};
                        console.log(row);
                        resolve(row);
                    }catch (err){
                        console.log(err);
                        reject(err);
                    }
                })()
        })
    }
}
let test = new Stdaily();
test.page("http://www.stdaily.com/kh/khpd/2017-11/11/content_594874.shtml")
    .then(rows=>console.log(rows));
module.exports = Stdaily;