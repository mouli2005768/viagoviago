export const BASEURL = "http://localhost:6002/";

// Function to set session cookies
export function setSession(sesName, sesValue, expDays) {
    let D = new Date();
    D.setTime(D.getTime() + expDays * 86400000);
    document.cookie = `${sesName}=${sesValue};expires=${D.toUTCString()};path=/;secure`;
}

// Generic API call function
export function callApi(reqmethod, url, data, responseHandler) {
    let options = {
        method: reqmethod,
        headers: { 'Content-Type': 'application/json' },
    };

    if (reqmethod !== "GET" && reqmethod !== "DELETE") {
        options.body = data; // Already JSON.stringified in App.js
    }

    fetch(url, options)
        .then(response => {
            if (!response.ok) throw new Error(response.status + ": " + response.statusText);
            return response.text();
        })
        .then(responseData => responseHandler(responseData))
        .catch(error => alert("API Error: " + error.message));
}

// Forgot Password API Call
export function forgotPassword(email, responseHandler) {
    if (!email) {
        alert("Please enter your email address.");
        return;
    }

    let data = JSON.stringify({ emailid: email });
    callApi("POST", `${BASEURL}user/forgotpassword`, data, responseHandler);
}