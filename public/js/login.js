document.querySelector('form').addEventListener('submit', function () {
    document.getElementById('loading-screen').style.display = 'block';
});

document.getElementById('hamburger').addEventListener('click', function () {
    const dropdown = document.getElementById('menu-dropdown');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
});

document.addEventListener("DOMContentLoaded", function () {
    const animatedTitle = document.getElementById("animatedTitle");
    const animatedText = document.getElementById("animatedText");
    const subText = document.getElementById("subText");
    const ctaButton = document.getElementById("ctaButton");

    const titleAnimationDuration = 4000;

    setTimeout(() => {
        animatedText.style.display = "block";
        animatedText.style.opacity = 1;
    }, titleAnimationDuration);

    setTimeout(() => {
        subText.style.display = "block";
        subText.style.opacity = 1;
    }, titleAnimationDuration + 1500);

    setTimeout(() => {
        ctaButton.style.display = "block";
        ctaButton.style.opacity = 1;
    }, titleAnimationDuration + 3000);
});



document.querySelector('.login-form').addEventListener('submit', function (e) {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        e.preventDefault();
        alert("Please fill out both username and password.");
    }
});


