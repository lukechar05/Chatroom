let timeoutID;
let timeout = 1000;



function setup() {
	
	timeoutID = window.setTimeout(checkRooms, timeout);
    console.log("Setting up!!")

	
}


function checkRooms() {

	console.log("Polling for new rooms");
	fetch("/addRoom")
		
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			console.log("did we get here")
			if (result.length == 0) { 
				const tableRef = document.getElementById("roomTable");
				const newRow = tableRef.insertRow();
				const newText = document.createTextNode("Sorry there are no rooms to join"); 
				newRow.appendChild(newText);
			}
			else { 
				insertRooom(result);
			}
		})
		.catch(() => {
			console.log("Error fetching items!");
		});
}

function insertRooom(result) { 

    const tab = document.getElementById("roomTable");
	console.log("Result is " + result);
	while (tab.rows.length > 0) {
		tab.deleteRow(0);
	}
	
	for (var i = 0; i < result.length; i++) {
		addRow(result[i]);
	} 
	timeoutID = window.setTimeout(checkRooms, timeout);
}

function addRow(row) {
	console.log("Row is" + row)
	const tableRef = document.getElementById("roomTable");
	// Create new row
	const newRow = tableRef.insertRow();
	// create cell in that row
	const newCell = newRow.insertCell();

	// add text to cell, the text is the name of the room
    const newText = document.createTextNode(row);
    newCell.appendChild(newText);

	var form = document.createElement("form");
	form.setAttribute("method", "get");

    form.setAttribute("action", "url_for('landingFunctions', what = 'join', roomName = row)");
	var submitButton = document.createElement("input");
	submitButton.setAttribute("type", "submit");
    submitButton.setAttribute("value", "Join Room");
	form.appendChild(submitButton);

	const newCell2 = newRow.insertCell();

	newCell2.appendChild(form);


	//row is the name of the room, so query through all of the rooms by the name and then get the first one and you have the id??

}


window.addEventListener("load", setup);

