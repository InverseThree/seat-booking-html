document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('loginButton').addEventListener('click', function () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById("remember").checked;
 
    if (!username || !password) {
      alert('Username and password cannot be empty');
      return;
    }
 
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('remember', remember);
 
    fetch('/auth/login', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          alert(`Logged as ${data.user.username}`);
          window.location.href = '/user.html';
        } else if (data.status === 'failed') {
          alert(data.message);
        } else {
          alert('error');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert(error);
      });
  });
});
