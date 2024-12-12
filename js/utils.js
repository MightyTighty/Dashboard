// utils.js
function validateToken() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        alert('Please log in to access this page.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;

        if (Date.now() >= expiry) {
            alert('Session expired. Please log in again.');
            logoutUser();
        }
    } catch (error) {
        console.error('Invalid token:', error);
        logoutUser();
    }
}

function logoutUser() {
    localStorage.clear();
    window.location.href = 'login.html';
}
