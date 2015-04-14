var http = require('http');
var sys = require('sys');
var fs = require('fs');
var url = require("url");
var qs = require('querystring');
var pg = require('pg');


var config = {
	home: "urls.html",
	home1: "home.html",
	work: "work.js",
	styles: "styles.css"
}

http.createServer(function(request, response) {

	console.log("SERVER CREATED ", request.url);
	var url = request.url;

	switch (url) {
		case "/":
			response.end(fs.readFileSync(config.home1).toString());
			break;

		case "/tiny":
			var tiny = "tiny";
			var url = "charan";
			var clicks = 100;

			var conString = "pg://charan-1120:zBuddy@100@localhost:5432/charan";
			var client = new pg.Client(conString);
			client.connect(function(err) {

				var query = client.query("select * from url", function(err, result) {
					console.log("arguments ", arguments);

					var rows = arguments[1].rows;
					console.log("rows ", rows);
					client.end();
					response.write(JSON.stringify(rows));
					response.end();
				});
			});
			//pg.connect("postgres://bznwdpxekczzzr:MUxGQ1Rk_fhtLsq-tYhXKlfbAN@ec2-54-163-239-102.compute-1.amazonaws.com:5432/daotlq37kvoaer", function(err, client) {
			/*	pg.connect("postgres://charan-1120:zBuddy@100@localhost:5432/charan", function(err, client) {
				console.log("TEST TEST ",arguments);
				var query = client.query("INSERT  INTO url VALUES ('+"+tiny+"',+'"+url+"',"+clicks+");");
					query.on("row",function(err,client){
						console.log("arguments ",arguments);
					});
			});*/

			break;

		case "/shorten":
			var body = '';

			request.on('data', function(data) {
				body += data;
			});

			request.on('end', function() {

				var POST = qs.parse(body);
				var originalUrl = POST.url;
				var tinyUniqueKey = (+new Date()).toString(36);

				var conString = "pg://charan-1120:zBuddy@100@localhost:5432/charan";
				var client = new pg.Client(conString);

				client.connect(function(err) {

					if (err) {
						return console.log("Error Occured", err);
					}

					client.query("INSERT INTO url VALUES('" + tinyUniqueKey + "','" + originalUrl + "',1);", function() {
						response.writeHead(200, {
							'content-type': 'application/json' //No I18N
						});

						response.write(tinyUniqueKey.toString());
						response.end();
						client.end();
					});
				});
			});
			break;

		case "/allurl":

			var conString = "pg://charan-1120:zBuddy@100@localhost:5432/charan";
			var client = new pg.Client(conString);

			client.connect(function(err) {
				client.query("SELECT * FROM url", function(err, result) {

					if (err) {
						return console.log("Error Occured While getting all urls data", err);
					}

					var dataArr = result.rows;

					response.writeHead(200, {
						'content-type': 'application/json' //No I18N
					});

					response.write(JSON.stringify(dataArr));
					response.end();
					client.end();
				});
			});
			break;

		case "/work.js":
			response.end(fs.readFileSync(config.work).toString());
			break;
		case "/styles.css":
			response.end(fs.readFileSync(config.styles).toString());
			break;
		default:
			var randomKey = url.substr(1);
			if (randomKey) {
				var conString = "pg://charan-1120:zBuddy@100@localhost:5432/charan";
				var client = new pg.Client(conString);
					client.connect(function(err) {
					
					//First test randomkey exists in DB or not.
					
					client.query("select * from url", function(err, result) {

						if (err) {
							response.write("Error occured during redirection");
							return console.log("Error occured while redirection stage1");
						}

						var isKeyExists = isTinyUniqueKeyExists(result.rows, randomKey);

						if (isKeyExists) {
							redirectToOriginalUrl(randomKey, response);
						} else {
							console.log("No Such key Exists");
							response.end();
							client.end();
						}
					})
				});
			}
			break;
	}
}).listen(2020);

function isTinyUniqueKeyExists(dataArr, tinyKey) {

	var len = dataArr.length;

	if (len > 0) {
		for (var i = 0; i < len; i++) {
			var row = dataArr[i];
			if (row.tiny === tinyKey) {
				return true;
			}
		}

	}
	return false;
}

function redirectToOriginalUrl(tiny, response) {


	var conString = "pg://charan-1120:zBuddy@100@localhost:5432/charan";
	var client = new pg.Client(conString);
	client.connect(function(err) {

		client.query("select longurl from url where tiny='" + tiny + "'", function(err, result) {

			if (err) {
				return console.log("Error Occured While redirecting to long url", err);
			}
			var longUrl = result.rows[0].longurl;

			if (longUrl){

					client.query("select clicks from url where tiny='" + tiny + "';", function(err,result) {

						var clickCount = result.rows[0].clicks;

						console.log("clickCount ",clickCount);
						clickCount = ++clickCount;

						console.log("clickCount2 ",clickCount);

						client.query("update url set clicks="+clickCount+" where tiny='" + tiny + "';", function(err,result) {
								console.log(result);
							client.end();
						});
					});
			}


			response.writeHead(302, {
				'Location': longUrl
			});
			response.end();

		});

	});

	/*connection.query("use tinyurls;", function() {

		connection.query("select original from urls where tiny='" + tiny + "'", function() {

			var dataArr = arguments[1];

			if (dataArr.length) {

				var original = arguments[1] ? dataArr[0].original : undefined;

				if (original !== undefined) {

					connection.query("select visitcount from urls where tiny='" + tiny + "';", function() {
						var visitcount = arguments[1][0].visitcount;
						visitcount = ++visitcount;
						connection.query("update urls set visitcount=" + visitcount + " where tiny='" + tiny + "' ;", function() {
							console.log("VISIT COUNT UPDATED");
						});
					});
					response.writeHead(302, {
						'Location': original
					});
					response.end();
				}
			}
		});

	});*/

	return 0;
}