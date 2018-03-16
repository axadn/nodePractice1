const http = require('http');
const https = require('https');
const qs = require('querystring');

function getUsername(req, done){
    let body = '';
    req.on('data', buffer =>{
        body += buffer;
        if(body.length > 255){
            req.connection.destroy();
        }
    });
    req.on('end', ()=>{
        const username = qs.parse(body).username;
        done(username);
    });
}

function getStarred(username, done){
    https.get({
        headers:{
             "User-Agent": "axadn"
        },
        "host": `api.github.com`,
        "path": `/users/${username}/starred`},
     res=>{
        let data = '';
        res.on('data', buffer =>{
            data += buffer;
        });
        res.on('end', ()=>{
            done(data);
        });
    });
}

function renderStarred(starred, req){
    req.end(JSON.stringify(JSON.parse(starred)
        .map(
            el => ({name: el.name,url: el.html_url})
        ))
    );
}

const server = http.createServer((req, res)=>{
    if(req.method == 'POST'){
        getUsername(req,
            username => getStarred(
                username,
                starred => renderStarred(starred, res) 
            )
        );
    }
    else{
        res.end("not a post request");
    }
});




server.listen(3000, () => console.log("listening on port 3000"));