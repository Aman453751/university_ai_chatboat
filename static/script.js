async function sendMessage() {
    const input = document.getElementById("user-input");
    const message = input.value.trim();

    if (message === "") {
        return;
    }

    const chatBox = document.getElementById("chat-box");

    // Show user's message
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.innerText = message;
    chatBox.appendChild(userMessage);

    // Clear input box
    input.value = "";

    try {
        // Updated URL to point explicitly to the backend server port (5000)
        // Note: Change '/api/chat' or '/chat' to match your chat_bp route definition
        const response = await fetch("http://127.0.0.1:5000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();

        // Show bot response
        const botMessage = document.createElement("div");
        botMessage.className = "bot-message";
        // Handles both 'reply' or 'response' payload keys safely
        botMessage.innerText = data.reply || data.response || "No response text received.";
        chatBox.appendChild(botMessage);

    } catch (error) {
        console.error("Fetch error:", error);
        
        // Display user-friendly error in chat
        const errorMessage = document.createElement("div");
        errorMessage.className = "error-message";
        errorMessage.innerText = "Connection error. Please make sure the Flask backend server is running.";
        chatBox.appendChild(errorMessage);
    }

    // Scroll to latest message
    chatBox.scrollTop = chatBox.scrollHeight;
}