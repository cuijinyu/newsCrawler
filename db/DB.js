let config=require("./DBConfig");
let mysql=require("mysql");
let pool=mysql.createPool(config.mysql);
//sql语句执行
function query(sql,callback) {
    return new Promise((resolve,reject)=>{
        pool.getConnection((err,connection)=>{
            connection.query(sql,(err,rows)=>{
                if(err){
                    connection.end();
                    reject(err);
                }else {
                    connection.end();
                    resolve(rows);
                }
            })
        })
    })
}
exports.query=query;