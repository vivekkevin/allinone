document.addEventListener("DOMContentLoaded", () => {
    const requestOtpButton = document.getElementById("request-otp");
    const verifyOtpButton = document.getElementById("verify-otp");
    const otpInput = document.getElementById("otp-input");
    const otpStatus = document.getElementById("otp-status");
    const adminChatWindow = document.getElementById("admin-chat-window");
    const otpVerification = document.getElementById("otp-verification");
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");

    const ALLOWED_EMAIL = "vivekkevin1995@gmail.com"; // Replace with your allowed email for testing

    // Function to request OTP
    const requestOtp = async () => {
        try {
            const response = await fetch("/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: ALLOWED_EMAIL }),
            });

            const result = await response.json();
            if (result.success) {
                otpVerification.style.display = "block";
                otpStatus.textContent = "OTP sent successfully!";
                otpStatus.style.color = "green";
            } else {
                otpStatus.textContent = result.message;
                otpStatus.style.color = "red";
            }
        } catch (error) {
            otpStatus.textContent = "Error sending OTP. Please try again.";
            otpStatus.style.color = "red";
            console.error("Error requesting OTP:", error);
        }
    };

    // Function to verify OTP
    const verifyOtp = async () => {
        try {
            const otp = otpInput.value;
            const response = await fetch("/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: ALLOWED_EMAIL, otp }),
            });

            const result = await response.json();
            if (result.success) {
                otpVerification.style.display = "none";
                adminChatWindow.style.display = "block";
            } else {
                otpStatus.textContent = result.message;
                otpStatus.style.color = "red";
            }
        } catch (error) {
            otpStatus.textContent = "Error verifying OTP. Please try again.";
            otpStatus.style.color = "red";
            console.error("Error verifying OTP:", error);
        }
    };

    // Function to send a message
    const sendMessage = async (message) => {
        try {
            const response = await fetch("/send-message-to-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: ALLOWED_EMAIL, message }),
            });

            const result = await response.json();
            if (result.success) {
                const messageElement = document.createElement("p");
                messageElement.textContent = `Admin: ${message}`;
                chatMessages.appendChild(messageElement);
                chatInput.value = "";
            } else {
                alert("Failed to send message.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Attach event listeners
    requestOtpButton.addEventListener("click", requestOtp);
    verifyOtpButton.addEventListener("click", verifyOtp);

    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message) {
            sendMessage(message);
        }
    });
});
