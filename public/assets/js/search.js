// --------------------------------------------------------------------------------------
// Search Toggle functionality to show/hide the search bar when toggling the search icon:
const searchToggle = document.getElementById('search-toggle');
// const searchBar = document.getElementById('search-bar');
// const searchInput = searchBar.children[0];

const navContainer = document.getElementById('nav-container');
const searchInput = navContainer.querySelector('input')

// Add event listener to the icon:
searchToggle.addEventListener('click', () => {
  // Toggles the 'active' class on the search container:
  navContainer.classList.toggle('active');

  // If search bar is active, focus the input field for typing:
  if (navContainer.classList.contains('active')) {
    searchInput.focus();
  } else {
    // Clear the input field when closing:
    // searchInput.value = '';
  }
});

// Hide it again when user clicks outside of it:
document.addEventListener('click', (event) => {
  // Check if click is outside the icon AND outside the search container
  const isClickInsideBar = navContainer.contains(event.target);
  const isClickOnToggle = searchToggle.contains(event.target);

  // If search bar is open AND the click is neither on the bar or icon:
  if (navContainer.classList.contains('active') && !isClickInsideBar && !isClickOnToggle) {
      navContainer.classList.remove('active');
      searchInput.value = '';
  }
});
// --------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------
// Game search lookup functionality:
