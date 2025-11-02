document.addEventListener('DOMContentLoaded', () => {
  const contentNodes = document.querySelectorAll('.sidescroll-list');
  const leftEdgeNodes = document.querySelectorAll('.left.chevron-container');
  const rightEdgeNodes = document.querySelectorAll('.right.chevron-container');

  // Check if all elements exist before trying to attach handlers:
  if (!contentNodes || !leftEdgeNodes || !rightEdgeNodes) {
    console.error("Missing scroll nodes; check class names.");
    return;
  }

  // Calculate the `.game-card` width in pixels:
  const rootElement = getComputedStyle(document.documentElement);
  // Get the `.game-card` width and gap in % as a number:
  const cardWidth = parseFloat(rootElement.getPropertyValue('--card-width'));
  const gap = parseFloat(rootElement.getPropertyValue('--sidescroller-gap'));
  // Get `.sidescroll-list` size of % in pixels:
  const percentageSize = parseFloat(document.querySelector('.sidescroll-list').clientWidth) / 100;
  const scrollAmount = (cardWidth + gap * 0.7) * percentageSize;

  // console.log(cardWidth);
  // console.log(gap);
  // console.log(percentageSize);
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
