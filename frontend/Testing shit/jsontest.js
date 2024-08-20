async function fetchSkillTree() {
    fetch('https://70803d49-af6e-440b-babd-f5e030b01349-00-2ubwx5yb03fkv.kirk.replit.dev/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Ensure the server expects JSON
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())  // Parse the JSON response
    .then(data => {
        console.log('Success:', data);  // Handle the response
    })
    .catch((error) => {
        console.error('Error:', error);  // Handle any errors
    });
}

// Call the function when the page loads
fetchSkillTree();


