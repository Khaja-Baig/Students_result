// Function to show loading screen
function showLoadingScreen() {
    document.getElementById("loadingScreen").style.display = "block";
}

// Function to hide loading screen
function hideLoadingScreen() {
    document.getElementById("loadingScreen").style.display = "none";
}

// Function to fetch and display data
async function fetchAndDisplay() {
    const gmailInput = document.getElementById("gmail");
    const gmail = gmailInput.value;
    showLoadingScreen();

    try {
        const sheetid = "1sqSLgVUcVXn9S2Jb9hi9SGE1kST1Kp8ZOdgfv409kjE";
        const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheetid}/export?format=csv`);
        const csvData = await response.text();

        const dataArray = [];
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');

        const driveLinkColumnIndex = headers.indexOf('drive link'); // Find the index of the "drive link" column
        const resultStatusColumnIndex = headers.indexOf('result status'); // Find the index of the "result status" column

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                if (j !== driveLinkColumnIndex) { // Skip the "drive link" column
                    obj[headers[j]] = values[j];
                }
            }
            dataArray.push(obj);
        }

        const jsonData = {};
        dataArray.forEach(row => {
            const email = row['Email Address'];
            if (jsonData[email]) {
                if (!Array.isArray(jsonData[email])) {
                    jsonData[email] = [jsonData[email]];
                }
                jsonData[email].push(row);
            } else {
                jsonData[email] = row;
            }
        });

        const dataContainer = document.getElementById("dataContainer");
        dataContainer.innerHTML = ""; // Clear previous data

        if (jsonData[gmail]) {
            const dataArray = Array.isArray(jsonData[gmail]) ? jsonData[gmail] : [jsonData[gmail]];

            const table = document.createElement("table");
            table.classList.add("data-table"); // Add a class for styling

            const tableHead = document.createElement("thead");
            const tableBody = document.createElement("tbody");

            const headerRow = document.createElement("tr");
            for (const key in dataArray[0]) {
                const th = document.createElement("th");
                th.textContent = key;
                headerRow.appendChild(th);
            }
            tableHead.appendChild(headerRow);

            dataArray.forEach(item => {
                const dataRow = document.createElement("tr");
                for (const key in item) {
                    const td = document.createElement("td");
                    td.textContent = item[key];

                    if (key === 'result status') { // Check if it's the "result status" column
                        const resultStatus = item[key].toLowerCase();
                        td.className = resultStatus === 'fail' ? 'fail' : 'pass'; // Use CSS class for coloring
                    }

                    dataRow.appendChild(td);
                }
                tableBody.appendChild(dataRow);
            });

            table.appendChild(tableHead);
            table.appendChild(tableBody);
            dataContainer.appendChild(table);
        } else {
            const notFoundDiv = document.createElement("div");
            notFoundDiv.textContent = "No data found for the provided Gmail address.";
            dataContainer.appendChild(notFoundDiv);
        }

        // Clear the input field after data is displayed
        gmailInput.value = "";

        hideLoadingScreen();
    } catch (error) {
        hideLoadingScreen();
        console.error("Error fetching or processing data:", error);
    }
}

// Attach event listener to the Fetch Data button
const fetchButton = document.getElementById("fetchButton");
fetchButton.addEventListener("click", fetchAndDisplay);
