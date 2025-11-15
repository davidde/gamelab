// Retrieve the value of a specific cookie:
// (Returns null if not found.)
function getCookie(name) {
  const nameToMatch = name + "=";
  const cookieArray = document.cookie.split('; ');

  for(let i = 0; i < cookieArray.length; i++) {
    let currentCookie = cookieArray[i];

    // Check if the cookie name matches:
    if (currentCookie.indexOf(nameToMatch) === 0) {
      // Return only the value:
      return currentCookie.substring(nameToMatch.length, currentCookie.length);
    }
  }
  return null;
}

// Set a persistent cookie with an expiration date:
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    // Calculate expiration date in milliseconds:
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  // Set the cookie: Name=Value; Expires=Date; Path=/ (available site-wide):
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

document.addEventListener('DOMContentLoaded', () => {
  const COOKIE_NAME = 'visited';
  const EXPIRATION_DAYS = 60;

  // Check if the cookie is set:
  if (!getCookie(COOKIE_NAME)) {
    window.alert("This project was made for a 𝘀𝗰𝗵𝗼𝗼𝗹 𝗮𝘀𝘀𝗶𝗴𝗻𝗺𝗲𝗻𝘁.\n\n\
The login functionality is insecure and for demonstration purposes only.");
    setCookie(COOKIE_NAME, 'true', EXPIRATION_DAYS);
  }
});
