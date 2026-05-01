function runContactPage() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Stops the page from redirecting

        const form = e.target;
        const resultDiv = document.getElementById('formResult');
        const submitBtn = document.getElementById('submitBtn');

        // Change button to show it's working
        submitBtn.textContent = "Sending...";
        submitBtn.style.opacity = "0.7";
        submitBtn.disabled = true;

        // Gather all the inputs
        const formData = new FormData(form);

        // Send the data invisibly to the Web3Forms API
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            resultDiv.style.display = "block";

            if (data.success) {
                // IT WORKED!
                resultDiv.innerHTML = "✅ Message sent successfully! We will get back to you soon.";
                resultDiv.style.color = "#4ade80"; // Match the green button
                form.reset(); // Clear the text boxes
            } else {
                // SOMETHING BROKE ON THEIR END
                resultDiv.innerHTML = "❌ Something went wrong. Try again.";
                resultDiv.style.color = "#ff6b6b";
            }

            // Reset the button
            submitBtn.textContent = "Send Message";
            submitBtn.style.opacity = "1";
            submitBtn.disabled = false;
        })
        .catch(error => {
            // THE USER LOST INTERNET CONNECTION
            resultDiv.style.display = "block";
            resultDiv.innerHTML = "❌ Error connecting to the server. Please check your internet.";
            resultDiv.style.color = "#ff6b6b";
            submitBtn.textContent = "Send Message";
            submitBtn.style.opacity = "1";
            submitBtn.disabled = false;
        });
    });
}

// Ensure the code runs when the SPA router loads the page
if (document.readyState === "complete" || document.readyState === "interactive") {
    runContactPage();
} else {
    document.addEventListener("DOMContentLoaded", runContactPage);
}