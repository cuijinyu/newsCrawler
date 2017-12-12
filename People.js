let cheerio=require('cheerio') ;
let superagent = require("superagent");
let request = require("superagent-charset")(superagent);
let mysql = require("mysql");
let db = require("../db/DB");
let util = require("../utils/util")
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
/**
 * 人民网类
 * @constructor
 */
let People = function(){};
People.prototype = {
    index:function(){
        return new Promise((resolve, reject) => {
            request.get("https://www.people.com.cn")
                .charset("gbk")
                .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
                .end(function (err, res) {
                    if (err) {
                        reject(err);
                    }
                    let $ = cheerio.load(res.text);
                    let focus = $("#focus_list ul li"),
                          port   = $("nav a"),
                          citys  = $(".city_list a");
                    let focusList = [];
                    let cityList = [];
                    let portList = [];
                    for (let i = 0; i < focus.length; i++) {
                        focusList.push(
                            {
                                title: $(focus[i]).text(),
                                url: $(focus[i]).children().attr("href")
                            }
                        );
                    }
                    for(let i = 0; i< citys.length; i++){
                        cityList.push({
                            city:$(citys[i]).text(),
                            url:$(citys[i]).attr("href")
                        })
                    }
                    for(let i = 0;i<port.length;i++){
                        portList.push({
                            name:$(port[i]).text(),
                            url:$(port[i]).attr("href")
                        })
                    }
                    let data = {
                        city:cityList,
                        port:portList,
                        focusList:focusList
                    }
                    // console.log(focusList);
                    resolve(data);
                })
        })
    },
    homePage: function (url) {
        /**
         * 返回Promise
         */
        return new Promise((resolve, reject) => {
            request.get(url)
                .charset("gbk")
                .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
                .end(function (err, res) {
                    if (err) {
                        reject(err);
                    }
                    let $ = cheerio.load(res.text);
                    let focus = $("#focus_list ul li");
                    let focusList = [];
                    for (let i = 0; i < focus.length; i++) {
                        focusList.push(
                            {
                                title: $(focus[i]).text(),
                                url: $(focus[i]).children().attr("href")
                            }
                        );
                    }
                    console.log(focusList);
                    resolve(focusList);
                })
        })
    },
    picArticle: function (url) {
        /**
         * 对文章的爬虫
         */
        return new Promise((resolve, reject) => {
            request.get(url)
                .charset("gbk")
                .end((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    let $ = cheerio.load(res.text);
                    let title = $(".title h1").text();
                    let content = $(".content").text();
                    let picLength = $(".page_n a").length -1 ;
                    let picUrls = [];
                    for(let i=0 ;i < picLength;i++){
                        (async function(){

                        })()
                    }
                    // console.log({
                    //     title: title,
                    //     content: content
                    // })
                    resolve({
                        title: title,
                        content: content
                    })
                })
        })
    },
    article: function (url) {
        return new Promise((resolve, reject) => {
            request.get(url)
                .charset('gbk')
                .end((err, res) => {
                    if (err) {
                        reject(err)
                    }
                    let $ = cheerio.load(res.text);
                    let preTitle = $(".text_title h3").text(),
                        title = $(".text_title h1").text(),
                        time = $(".box01 .fl").text(),
                        content = $("#rwb_zw").children().text();
                    // console.log(preTitle);
                    // console.log(title);
                    // console.log(time);
                    // console.log(content);
                    resolve({
                        preTitle: preTitle,
                        title: title,
                        time: time,
                        content: content
                    })
                })
        })
    },
    tv: function (url) {
        return new Promise((resolve, reject) => {
            request.get(url)
                .charset('gbk')
                .end((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    let $ = cheerio.load(res.text);
                    let videoUrl = $("");
                    resolve({
                        success: false,
                        reason: 'now still can not fatch the url'
                    });
                })
        })
    },
    adapter: function (url) {
        let self = this;
            return new Promise((resolve, reject) => {
                    let tvPatt = /tv./i,
                        picPatt = /pic./i;
                    if (tvPatt.exec(url)) {
                        resolve({
                            type:'tv',
                            url:this.tv(url)
                    });
                    } else if (picPatt.exec(url)) {
                        resolve(this.picArticle(url));
                    } else {
                        getgbkPages(url)
                            .then(text=>{
                                let $ = cheerio.load(text);
                                let PicTest = $(".title h1").text();
                                let articleTest = $(".text_title h1").text();
                                if(PicTest != undefined){
                                    resolve({

                                    })
                                }else if(articleTest != undefined){
                                    resolve({
                                         preTitle : $(".text_title h3").text(),
                                        title : $(".text_title h1").text(),
                                        time : $(".box01 .fl").text(),
                                        content : $("#rwb_zw").children().text()
                                    })
                                }else{
                                    resolve({
                                         title : $(".title h1").text(),
                                         content : $(".content").text()
                                    })
                                }
                            })
                    }
                })
        },
        pic:function(url){
            return new Promise((resolve,reject)=>{
                request.get(url)
                    .charset('gbk')
                    .end((err,res)=>{
                        let $ = cheerio.load(res.text);

                    })
            })
        },
        arctlePic:function(url){
            /**
             * 这个是真正的图文   囧  o(╯□╰)o
             */
            return new Promise((resolve,reject)=>{
                    let text ;
                    util.getgbkPages(url)
                        .then(row=>{
                            text = row;
                            return text;
                        }).then(text=>{
                                let $ = cheerio.load(text);
                                console.log(text);
                                let preTitle = $(".pre").text(),
                                    title = $(".text_title h1").text(),
                                    subTitle = $(".sub").text(),
                                    author = $(".author").text(),
                                    time = $(".box01 .fl").text(),
                                    content = $(".text_con_left").text();
                                let images = $(".text_con_left img");
                                console.log(images);
                                resolve({
                                    preTitle:preTitle,
                                    title:title,
                                    subTitle:subTitle,
                                    author:author,
                                    time:time,
                                    content:content
                                })
                      }).catch(err=>{
                          console.log(err);
                    })
             })
        }
    }
    let test = new People();
test.arctlePic("http://sx.people.com.cn/n2/2017/1202/c189132-30987510.html")
    .then(row=>{
        console.log(row)
    })
module.exports = People;
let getgbkPages=function(url){
    return new Promise((resolve,reject)=>{
        console.log('=============')
        console.log(url)
        console.log('=============')
        request.get(url)
            .charset("gbk")
            .end((err,res)=>{
                if(err){
                    reject(err);
                    console.log(err);
                }
                // console.log(res);
                resolve(res.text);
            })
    })
}