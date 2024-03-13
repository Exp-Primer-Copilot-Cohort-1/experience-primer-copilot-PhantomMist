// create Web server
const http = require('http');
// create file system
const fs = require('fs');
// create path
const path = require('path');
// create url
const url = require('url');
// create querystring
const qs = require('querystring');
// create template
const template = require('./lib/template.js');
// create db
const db = require('./lib/db.js');
// create sanitize-html
const sanitizeHtml = require('sanitize-html');

const app = http.createServer(function(request, response){
    let _url = request.url;
    let queryData = url.parse(_url, true).query;
    let pathname = url.parse(_url, true).pathname;
    let title = queryData.id;

    if(pathname === '/'){
        if(queryData.id === undefined){
            db.query(`SELECT * FROM topic`, function(error, topics){
                title = 'Welcome';
                let description = 'Hello, Node.js';
                let list = template.list(topics);
                let html = template.HTML(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        } else {
            db.query(`SELECT * FROM topic`, function(error, topics){
                if(error){
                    throw error;
                }
                db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(error2, topic){
                    if(error2){
                        throw error2;
                    }
                    let list = template.list(topics);
                    let html = template.HTML(topic[0].title, list,
                        `<h2>${sanitizeHtml(topic[0].title)}</h2>
                        ${sanitizeHtml(topic[0].description)}
                        <p>by ${sanitizeHtml(topic[0].name)}</p>`,
                        `<a href="/create">create</a>
                        <a href="/update?id=${queryData.id}">update</a>
                        <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${queryData.id}">
                            <input type="submit" value="delete">
                        </form>`
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if(pathname === '/create'){
        db.query(`SELECT * FROM topic`,