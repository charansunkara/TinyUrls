/**
Author:Charan
*/
var URLUtils = {};

(function(window) {

	function getAllUrlsDetails() {
		var xhr = new XMLHttpRequest();
			xhr.open('GET', "/allurl", true);
			xhr.onreadystatechange = function() {
				switch (xhr.readyState) {
					case 4:
						var response = JSON.parse(xhr.responseText);
						URLUtils.displyURLs(response);
						break;
						default:
						break;
				}	
			}
		xhr.send();
	}

	function generateURL(url){

		var urlValue = "";

		if($("userinput").value){
			urlValue = $("userinput").value;
		} else if (url){
			urlValue = url;
		}

		if(!urlValue){
			alert("Please enter a valid URL");
			return ;
		}
		
		var xhr = new XMLHttpRequest();
			xhr.open('POST', "/shorten", true);
			xhr.onreadystatechange = function() {

				switch (xhr.readyState) {
					case 4:
						var response = xhr.responseText;
						console.log("response ",response);
						getAllUrlsDetails();
						return response;
						break;

					default:
						break;
				}

			}
		var params = "url="+urlValue;
		xhr.send(params);
	}



	function sendDetailsToServer() {
		var tiny = generateURL();
	}

	function displayUrlsTable(dataArr) {

		var table = $("urlTable");
			table.innerHTML = "";
		var len = dataArr.length;
		var i;
		var headers = ["TINY URL","LONG URL","CLICKS"];
		var headerCount = headers.length;
		var row1 = document.createElement("tr");
		
		for(i=0;i<headerCount;i++){

			var header = document.createElement("th");	
				header.innerHTML = headers[i];
				header.className = "tableHeader";
				row1.appendChild(header);
		}
		table.appendChild(row1);

		for (i = 0; i < len; i++) {

			var row = document.createElement("tr");
			var urlObj = dataArr[i];

			for (var key in urlObj) {

				var cell = document.createElement("td");
					cell.className = "cell";
				var value = urlObj[key];

				if (key === "tiny" || key === "original") {

					if (key == "tiny") {
						value = location.protocol + "//" + location.host + "/" + value;
					}
					var link = document.createElement("a");
					link.setAttribute("target", "_blank");
					link.setAttribute("href", value);
					link.innerHTML = value;

					cell.appendChild(link);

				} else {
					cell.innerHTML = value;
				}
				row.appendChild(cell);
			}
			table.appendChild(row);
		}
	}



	URLUtils.shorten = sendDetailsToServer;
	URLUtils.displyURLs = displayUrlsTable;
	URLUtils.showAll = getAllUrlsDetails;
	URLUtils.generateShortURL = generateURL;
	
	document.addEventListener("DOMContentLoaded", onDOMLoad);

	function onDOMLoad(){
		var button = $("generate");
			button.addEventListener("click",URLUtils.shorten,false);
		
		URLUtils.showAll();	
	}
})(this)

function $(id) {
	return document.getElementById(id);
}
