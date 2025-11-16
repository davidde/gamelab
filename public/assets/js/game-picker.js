function checkAnswer(question) {
  // Get the elements for the two conditional follow-up questions:
  const followUp1 = document.getElementById('q1-follow-up-1')
  const followUp2 = document.getElementById('q1-follow-up-2');

  // Check the answer from the 'question' select:
  switch (question.selectedIndex) {
    case 0: // Default no selection, so hide both follow ups:
      followUp1.style.display = 'none';
      followUp2.style.display = 'none';
      break;
    case 1: // First data option (second select field),
      // so show first question:
      followUp1.style.display = 'block';
      followUp2.style.display = 'none';
      break;
    case 2: // Second data option (third select field),
      // so show second question:
      followUp1.style.display = 'none';
      followUp2.style.display = 'block';
  }
}