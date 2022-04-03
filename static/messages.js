let timeoutID;
let timeout = 1000;



function setup() {
	
	document.getElementById("theButton").addEventListener("click", makePost);
	timeoutID = window.setTimeout(poller, timeout);
    console.log("Setting up!!")
	
}


function makePost() {
	
	const chat = document.getElementById("message").value
	
	fetch("/new_chat", {
			method: "post",
			headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
			body: `chat=${chat}`
		})
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			updateFeed(result);
			clearInput();
		})
		.catch(() => {
			console.log("Error posting new items!");
		});


}

function poller() {

	console.log("Polling for new items");
	fetch("/chats")
		.then((response) => {

			if (!response.ok && response.status === 404) { 
				document.getElementById("chatTable").style.visibility = "hidden";
				document.getElementById("Form").style.visibility = "hidden";

				document.getElementById("delete").style.visibility = "visible";
			}
			else { 
				return response.json();
			}
		})
		.then((result) => {
			updateFeed(result);
		})
		.catch(() => {
			console.log("Error fetching items!");
		
		});
}

function updateFeed(result) {

	console.log("Result is" + result)

	const tab = document.getElementById("chatTable");
	while (tab.rows.length > 0) {
		tab.deleteRow(0);
	}
    for (var i = 0; i < result.length; i++) {
		addRow(result[i]);
	}
	timeoutID = window.setTimeout(poller, timeout);
}

function addRow(row) {

	console.log("Row is" + row)
	const tableRef = document.getElementById("chatTable");
	const newRow = tableRef.insertRow();
    const newText = document.createTextNode(row);
    newRow.appendChild(newText);
	

}

function clearInput() {
	console.log("Clearing input");
	document.getElementById("message").value = "";
}

window.addEventListener("load", setup);
