document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const statusDiv = document.getElementById('auth-status');
  const registerMessage = document.getElementById('register-message');
  const loginMessage = document.getElementById('login-message');
  const logoutButton = document.getElementById('logout-button');
  const tabContainer = document.getElementById('tab-container');
  const profileName = document.getElementById('profile-name');

  // Retrieves all registered users from Local Storage:
  function getRegisteredUsers() {
    const usersString = localStorage.getItem('registeredUsers');
    // Return array of users or an empty array if nothing is found:
    return usersString ? JSON.parse(usersString) : [];
  }

  function getCurrentUser() {
    const userString = localStorage.getItem('currentUser');
    return userString ? JSON.parse(userString) : null;
  }

  registerForm.addEventListener('submit', (event) => {
    // Stop the form from submitting normally / reloading page:
    event.preventDefault();
    // Clear previous messages:
    registerMessage.textContent = '';

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    let users = getRegisteredUsers();

    // Check if user already exists:
    if (users.some(user => user.username === username)) {
      registerMessage.textContent = 'Error: Username already exists.';
      registerMessage.style.color = 'red';
      return;
    }

    // Create new user object:
    const newUser = { username: username, password: password }; // SECURITY RISK
    users.push(newUser);

    // Save updated list of users:
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    registerMessage.innerHTML = `Account created!<br>You can now log in as ${username}.`;
    registerMessage.style.color = 'green';
    registerForm.reset();
  });

  loginForm.addEventListener('submit', (event) => {
    // Stop the form from submitting normally / reloading page:
    event.preventDefault();
    // Clear previous messages:
    loginMessage.textContent = '';

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    let users = getRegisteredUsers();

    // Find and validate credentials:
    const foundUser = users.find(user => user.username === username && user.password === password);

    if (foundUser) {
      // Log In successful; save user to 'currentUser' key:
      const date = new Date();
      const currentUser = {
        username: foundUser.username,
        loginTime: date.toLocaleTimeString(),
        loginDate: date.toLocaleDateString(),
        games: []
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      // Reset form and update UI:
      loginForm.reset();
      updateLoginStatus();
    } else { // Login failed:
      loginMessage.textContent = 'Error: Invalid username or password.';
      loginMessage.style.color = 'red';
    }
  });

  logoutButton.addEventListener('click', () => {
    // Clear session by removing currentUser from local storage:
    localStorage.removeItem('currentUser');
    updateLoginStatus();
  });

  function updateLoginStatus() {
    const user = getCurrentUser();

    if (user) {
      // User is logged in:
      profileName.textContent = `${user.username}'s Profile`;
      statusDiv.innerHTML = `✅ Logged in as <strong>${user.username}</strong> since <strong>${user.loginTime}</strong> (${user.loginDate}).`;
      registerForm.style.display = 'none';
      loginForm.style.display = 'none';
      tabContainer.style.display = 'none';
      logoutButton.style.display = 'inline-block';
    } else {
      // User is logged out:
      profileName.textContent = 'Profile';
      statusDiv.innerHTML = '❌ You are currently logged out.';
      registerForm.style.display = 'block';
      loginForm.style.display = 'block';
      tabContainer.style.display = 'block';
      logoutButton.style.display = 'none';
    }
  }

  // Initial check when the page loads:
  updateLoginStatus();

  // Login/Register Tab functionality:
  // Get all tab buttons and content panes:
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Add a click listener to every tab button
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get ID of content pane to show:
      const targetTabId = button.getAttribute('data-tab');

      // Delete form and message when changing tab:
      registerForm.reset();
      loginForm.reset();
      registerMessage.textContent = '';
      loginMessage.textContent = '';

      // Remove 'active' class from ALL buttons and panes:
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      // Add 'active' class to the clicked button:
      button.classList.add('active');

      // Add 'active' class to the target content pane:
      document.getElementById(targetTabId).classList.add('active');
    });
  });
});