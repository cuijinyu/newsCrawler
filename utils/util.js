let mysql = require('mysql');
let superagent = require("superagent");
let request = require("superagent-charset")(superagent);
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
module.exports={
    titleEscape : function (text) {
        if(text == undefined){
            return ;
        }
        return new Promise((resolve,reject)=>{
            text = text.replace("'","");
            text = text.replace("\n","");
            let result = mysql.escape(text);
            resolve(result);
        })
    },
    contentEscape : function(text){
        if(text == undefined){
            return ;
        }
        return new Promise((resolve, reject) => {
            text = text.replace("'","");
            text = text.replace("\n","");
            let result = mysql.escape(text);
            resolve(result);
        })
    },
    getgbkPages:function(url){
        return new Promise((resolve,reject)=>{
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
    },
    sleep:function(time){
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve();
        },time)
    })
    },
    urlTest:function(url,main){
        let patt = /http:/i;
        if(main[main.length-1]=='/'){
            main = main.slice(0,main.length-1);
        }
        if(patt.exec(url)){
            console.log("url" + url + "passed!!!!!!");
            return url;
        }else{
            return url = main+url;
        }
    },
    testAll:function (urls,main) {
        return new Promise((resolve => {
            let i=0;
            for(i;i<urls.length;i++){
                if(urls[i].url== undefined){
                    continue;
                }
                urls[i].url = urls[i].url.trim();
                urls[i].url=this.urlTest(urls[i].url,main);
            }
            if(i == urls.length){
                resolve(urls);
            }
        }))
    },
    /**
     * 检查是否为undefined
     * @param content
     */
    checkExist:function (content) {
        if(content == undefined){
            return "";
        }else{
            return content;
        }
    },
    getPage:function(url){
        return new Promise((resolve,reject)=>{
            superagent.get(url)
                .end((err,res)=>{
                    if(err){
                        reject(err)
                    }
                    else{
                        resolve(res.text)
                    }
                })
        })
    }
}
