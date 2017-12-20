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
            try{
                (async ()=>{
                    let text = await util.getPage("http://www.stdaily.com/cxzg80/index.shtml");
                    let $ = cheerio.load(text);
                    let a1 = $(".f_yw ul li a"),
                        a2 = $(".mt30 a"),
                        a3 = $(".fp_subtitle a"),
                        a4 = $()
                    console.log(a1);
                    a1 = a1.toArray();
                    a2 = a2.toArray();
                    a3 = a3.toArray();
                    let articles = [];
                     a1 = a1.concat(a2);
                     a1 = a1.concat(a3);
                    for(let i = 0 ;i <a1.length;i++){
                        let title = $(a1[i]).text(),
                            url = $(a1[i]).attr("href");
                        let temp = {title,url};
                        articles.push(temp);
                    }
                    articles = _.uniq(articles)
                    console.log(articles);
                    resolve(articles);
                })()
            }catch(err){
                console.log(err);
                reject(err);
            }
        })
    }

    /**
     * AI频道
     * @returns {Promise}
     */
    ai(){
        return new Promise((resolve,reject)=>{
            (async ()=>{
                let text = await util.getPage("http://www.stdaily.com/rgzn/index.shtml");
                let $ = cheerio.load(text);
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
                let text = await util.getPage('http://www.stdaily.com/kh/index.shtml');
                let $ = cheerio.load(text);
            })()
        })
    }

    /**
     * 获取人物访谈
     * @returns {Promise}
     */
    people(){
        return new Promise((resolve,reject)=>{
            try{
                (async ()=>{
                    let text = await util.getPage("http://www.stdaily.com/index/fangtan/fangtan.shtml");
                    for(let i = 2;i<20;i++){
                        text += await util.getPage(`http://www.stdaily.com/index/fangtan/fangtan_${i}.shtml`)
                    }
                    let $ = cheerio.load(text);
                    let urlList = $(".f_lieb_list h3");
                    let articles = [];
                    for(let i=0;i<urlList.length;i++){
                        let title = $(urlList[i]).text(),
                            url = $(urlList[i]).children().attr("href");
                        url = util.urlTest(url,"http://www.stdaily.com/");
                        let temp = {title,url};
                        articles.push(temp);
                    }
                    resolve(articles);
                })()
            }catch (e){
                console.log(e);
                reject(e);
            }
        })
    }

    /**
     *获得分栏目下的页面
     * @param url
     * @returns {Promise}
     */
    page(url){
        return new Promise((resolve,reject)=>{
            try{
                (async ()=>{
                    let data = await util.getPage(url);
                    // console.log(data.text);
                    let $ = cheerio.load(data);
                    let title = $(".aticleHead h1").text();
                    let time = $(".time").text().trim().slice(0,19);
                    let content = $(".content").text();
                    let pics = $(".content img"),
                        picUrls = [];
                    for(let i=0;i<pics.length;i++){
                        picUrls.push(util.urlTest($(pics[i]).attr("src")));
                    }
                    let row = {title,time,content,picUrls};
                    console.log(row);
                    resolve(row);
                })()
            }catch (err){
                console.log(err);
                reject(err);
            }
        })
    }
}
let test = new Stdaily();
test.news().then(rows=>console.log(rows));
module.exports = Stdaily;