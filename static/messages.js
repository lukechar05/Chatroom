

let timeoutID;
let timeout = 1000;

//  Setting up chat fetching, make sure clicking post actually 
function setup() {
	
	document.getElementById("postButton").addEventListener("click", makePost);
	timeoutID = window.setTimeout(updateChats, timeout);
    console.log("Setting up!!")
	
}


function makePost() {
	
	const chat = document.getElementById("message").value
	
	//  XML fetch request
	fetch("/new_chat", {
			method: "post",
			headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
			body: `chat=${chat}`
		})
		.then((response) => {
			return response.json();
		})
		//  If json is returned currectly (list of all chats for this room) then send that to update feed and clear input
		.then((result) => {
			updateFeed(result);
			clearChatInput();
		})
		.catch(() => {
			console.log("Error posting new chats!");
		});


}

//  polling function that fires every 1 second
function updateChats() {

	fetch("/chats")
		.then((response) => {

			//  Catch for when the room has been deleted, allow the user to navigate back to landing page
			if (!response.ok && response.status === 404) { 
				document.getElementById("chatTable").style.visibility = "hidden";
				document.getElementById("Form").style.visibility = "hidden";

				document.getElementById("delete").style.visibility = "visible";
			}
			else { 
				return response.json();
			}
		})
		//  Otherwise update the feed with the results
		.then((result) => {
			updateFeed(result);
		})
		.catch(() => {
			console.log("Error fetching chats!");
		
		});
}

function updateFeed(result) {

	console.log("Result is" + result)

	const tab = document.getElementById("chatTable");

	//  Delete all rows
	while (tab.rows.length > 0) {
		tab.deleteRow(0);
	}
	//  Add back chats in correct order
    for (var i = 0; i < result.length; i++) {
		addRow(result[i]);
	}
	
	//  Keep polling function going 
	timeoutID = window.setTimeout(updateChats, timeout);
}

function addRow(row) {

	console.log("Row is" + row)
	const tableRef = document.getElementById("chatTable");

	//  Create a new row in the table, insert the chat as a text node in that row 
	const newRow = tableRef.insertRow();
    const newText = document.createTextNode(row);
    newRow.appendChild(newText);
	

}

//  Function to clear chat input
function clearChatInput() {
	document.getElementById("message").value = "";
}

window.addEventListener("load", setup);
