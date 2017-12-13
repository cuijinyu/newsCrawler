let cheerio=require('cheerio') ;
let superagent = require("superagent");
let request = require("superagent-charset")(superagent);
let mysql = require("mysql");
const Url = require("url");
let db = require("../db/DB");
let util = require("../utils/util");
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
         * 对以图片为主的爬虫
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
                    let picLength = $(".page_n a:not(#prev):not(#next)").length -1 ;
                    let Urls = [];
                    let picUrls = [];
                    for(let i = 1;i < picLength;i++){
                        Urls.push(url .replace(".html","")+ "-" + (i+1)+".html");
                    }
                    console.log(Urls);
                    resolve({
                        title: title,
                        content: content,
                        urls:[]
                    })
                })
        })
    },
    /**
     * 这个是只含文本类文章的处理
     * @param url
     * @returns {Promise<any>}
     */
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
    /**
     * 这个是视频类文章的处理
     * @param url
     * @returns {Promise<any>}
     */
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
    /**
     * 适配器啦
     * @param url
     * @returns {Promise<any>}
     */
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
    /**
     * 我只是想爬个图片
     * @param url
     * @returns {Promise<any>}
     */
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
                                    content = $(".box_con").text();
                                let images = $(".box_con img");
                                let imageUrls = [];
                                for(let i=0;i<images.length;i++){
                                    let test = Url.parse(url);
                                    test = test.hostname;
                                    $(images[i]).attr("src",util.urlTest($(images[i]).attr("src"),'http://'+test))
                                    imageUrls.push($(images[i]).attr("src"));
                                }
                                console.log(images);
                                resolve({
                                    preTitle:preTitle,
                                    title:title,
                                    subTitle:subTitle,
                                    author:author,
                                    time:time,
                                    content:content,
                                    imgUrls:imageUrls
                                })
                      }).catch(err=>{
                          console.log(err);
                    })
             })
        },
        singlePicUrl:function (url) {
            return new Promise((resolve,reject)=>{
                util.getgbkPages(url)
                    .then(text=>{
                        let $ = cheerio.load(text);
                        resolve($(".pic_c img").attr("src"));
                    }).catch(err=>{
                        console.log(err);
                        reject(err);
                    })
            })
        }
    }
    let test = new People();
test.singlePicUrl("http://pic.people.com.cn/n1/2017/1213/c1016-29704989.html")
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