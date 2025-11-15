document.addEventListener('DOMContentLoaded', () => {
  const contentNodes = document.querySelectorAll('.sidescroll-list');
  const leftEdgeNodes = document.querySelectorAll('.left.chevron-container');
  const rightEdgeNodes = document.querySelectorAll('.right.chevron-container');

  // Check if all elements exist before trying to attach handlers:
  if (!contentNodes || !leftEdgeNodes || !rightEdgeNodes) {
    console.error("Missing scroll nodes; check class names.");
    return;
  }

  // Get the `.game-card` width and gap in pixels as a number:
  const cardWidth = parseFloat(window.getComputedStyle(
    document.querySelector('.game-card')).minWidth);
  const gap = parseFloat(window.getComputedStyle(
    document.querySelector('.sidescroll-list')).gap);
  const scrollAmount = cardWidth + gap;

  // console.log(cardWidth);
  // console.log(gap);
  // console.log(scrollAmount);

  // Attach event listeners to all nodes:
  // (We assume here the HTML code contains proper "sidescroller"s,
  // that all contain a "sidescroll-list", as well as left and right chevrons)
  for (const [index, content] of contentNodes.entries()) {
    leftEdgeNodes[index].addEventListener('click', () => {
      // The scrollLeft property is the key CSS property for horizontal scrolling:
      // (positive pixel scrollAmount for rightside scrolling, negative for leftside)
      content.scrollLeft += scrollAmount * -1;
    });
    rightEdgeNodes[index].addEventListener('click', () => {
      content.scrollLeft += scrollAmount;
    });
  }
});
