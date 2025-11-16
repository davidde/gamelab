function checkAnswer(question) {
  // Question is a main question:
  if (question.dataset.questionMain) {
    checkMain(question);
  }
  // Question is a followup question:
  else if (question.dataset.questionFollowup) {
    checkFollowup(question);
  }
}

function checkMain(question) {
  const questionGroup = question.closest('[data-question-group]');

  // Get the elements for the two conditional follow-up questions:
  const followUps = questionGroup.querySelectorAll('[data-question-followup]');
  const followLis = Array.from(followUps).map(folUp => folUp.closest('li'));

  // console.log("question.dataset.questionMain = ", question.dataset.questionMain);
  // console.log("question.dataset.questionFollowup = ", question.dataset.questionFollowup);
  // console.log("followUps = ", followUps);
  // console.log("followLis = ", followLis);

  switch (question.selectedIndex) {
    case 0: // Default no selection, so hide both follow ups:
      followLis[0].classList.add('hidden');
      followLis[1].classList.add('hidden');
      break;
    case 1: // First data option (second select field),
      // so show first question:
      followLis[0].classList.remove('hidden');
      followLis[1].classList.add('hidden');
      break;
    case 2: // Second data option (third select field),
      // so show second question:
      followLis[0].classList.add('hidden');
      followLis[1].classList.remove('hidden');
  }
}

function checkFollowup(question) {
  const questionGroup = question.closest('[data-question-group]');
  const nextQuestionGroup = questionGroup.nextElementSibling;

  if (!nextQuestionGroup) return;

  // Get the elements for the two conditional follow-up questions:
  const followUps = nextQuestionGroup.querySelectorAll('[data-question-followup]');
  const followLis = Array.from(followUps).map(folUp => folUp.closest('li'));

  // console.log("question.dataset.questionMain = ", question.dataset.questionMain);
  // console.log("question.dataset.questionFollowup = ", question.dataset.questionFollowup);
  // console.log("followUps = ", followUps);
  // console.log("followLis = ", followLis);

  switch (question.selectedIndex) {
    case 0: // Default no selection, so hide both follow ups:
      followLis[0].classList.add('hidden');
      followLis[1].classList.add('hidden');
      break;
    case 1: // First data option (second select field),
      // so show first question:
      followLis[0].classList.remove('hidden');
      followLis[1].classList.add('hidden');
      break;
    case 2: // Second data option (third select field),
      // so show second question:
      followLis[0].classList.add('hidden');
      followLis[1].classList.remove('hidden');
  }
}

function validateForm(event) {
  // Prevent default submission if you're handling it client-side (AJAX)
  event.preventDefault();

  // Create a FormData object from the form element (event.target)
  const formData = new FormData(event.target);

  // Use formData.forEach() or formData.entries() to iterate over all fields
  for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
  }
}