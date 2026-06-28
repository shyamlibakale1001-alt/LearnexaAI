const apiResponse = {
  userName: 'Sam',
  fileName: 'Chemistry Chapter 4.pdf',
  generatedAt: 'June 28, 2026 • 10:15 AM',
  summaryUrl: '#',
  notesUrl: '#',
  flashcardsUrl: '#',
  quizUrl: '#',
  flashcardCount: 32,
  quizCount: 20,
  readingTime: '12 mins',
  summaryText:
    'A concise summary of your Chemistry Chapter 4 notes, focusing on reaction mechanisms and key formulas.',
  notesText:
    'Organized notes with definitions, examples, and core ideas for fast review.',
  flashcards: [
    {
      front: 'What is the law of conservation of mass?',
      back: 'Mass cannot be created or destroyed in a closed system.'
    },
    {
      front: 'What is the product of an acid-base neutralization?',
      back: 'A salt and water are produced when an acid and base neutralize.'
    },
    {
      front: 'Which ion indicates acidity in water?',
      back: 'The hydrogen ion (H+) indicates acidity in aqueous solutions.'
    }
  ],
  quizItems: [
    {
      type: 'mcq',
      question: 'What is the main product of an acid-base neutralization?',
      options: ['Salt and water', 'Oxygen', 'Hydrogen gas', 'Carbon dioxide'],
      correctAnswer: 0,
      explanation: 'Neutralization between an acid and a base typically produces a salt and water.'
    },
    {
      type: 'truefalse',
      question: 'The CPU is considered the brain of the computer.',
      options: ['True', 'False'],
      correctAnswer: 0,
      explanation: 'The CPU performs processing and is often referred to as the brain of the computer.'
    },
    {
      type: 'fillblank',
      question: 'HTML stands for _________.',
      correctAnswer: 'HyperText Markup Language',
      explanation: 'HTML stands for HyperText Markup Language.'
    },
    {
      type: 'match',
      question: 'Match the computing terms to their roles.',
      pairs: [
        { left: 'CPU', right: 'Processing Unit' },
        { left: 'RAM', right: 'Temporary Memory' },
        { left: 'SSD', right: 'Storage Device' }
      ],
      explanation: 'Each item matches a core function in a computer system.'
    }
  ]
};

let studyPackData = null;
let flashcardState = {
  cards: [],
  activeIndex: 0,
  isFlipped: false
};
let quizState = {
  questions: [],
  currentIndex: 0,
  selectedAnswers: {},
  submitted: {},
  reviewMode: false,
  startedAt: null,
  completedAt: null
};

function getStudyPackData() {
  return Promise.resolve(apiResponse);
}

function populateDashboard(data) {
  studyPackData = data;
  const userName = document.getElementById('userName');
  const fileName = document.getElementById('fileName');
  const generatedAt = document.getElementById('generatedAt');
  const flashcardCount = document.getElementById('flashcardCount');
  const quizCount = document.getElementById('quizCount');
  const readingTime = document.getElementById('readingTime');

  if (userName) userName.textContent = data.userName;
  if (fileName) fileName.textContent = data.fileName;
  if (generatedAt) generatedAt.textContent = data.generatedAt;
  if (flashcardCount) flashcardCount.textContent = data.flashcardCount;
  if (quizCount) quizCount.textContent = data.quizCount;
  if (readingTime) readingTime.textContent = data.readingTime;
}

function pdfEscape(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n');
}

function createPdfBlob(text) {
  const lines = text.split('\n');
  const contentLines = lines
    .map((line) => `(${pdfEscape(line)}) Tj\n0 -14 Td\n`)
    .join('');

  const payload = `BT\n/F1 12 Tf\n72 750 Td\n${contentLines}ET\n`;
  const header = '%PDF-1.3\n';
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 =
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font <</F1 5 0 R>> >> >>\nendobj\n';
  const obj4 = `4 0 obj\n<< /Length ${payload.length} >>\nstream\n${payload}endstream\nendobj\n`;
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  const body = header + obj1 + obj2 + obj3 + obj4 + obj5;
  let offset = header.length;
  const offsets = [offset];
  offsets.push((offset += obj1.length));
  offsets.push((offset += obj2.length));
  offsets.push((offset += obj3.length));
  offsets.push((offset += obj4.length));

  const xref =
    'xref\n0 6\n0000000000 65535 f \n' +
    offsets.map((value) => `${value.toString().padStart(10, '0')} 00000 n \n`).join('');
  const startxref = body.length;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  return new Blob([body, xref, trailer], { type: 'application/pdf' });
}

function openPdfPreview(text) {
  const blob = createPdfBlob(text);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

function openSummary() {
  if (studyPackData?.summaryUrl && studyPackData.summaryUrl !== '#') {
    window.open(studyPackData.summaryUrl, '_blank');
    return;
  }
  openPdfPreview(`Learnexa AI Summary\n\n${studyPackData.summaryText}\n\nFile: ${studyPackData.fileName}`);
}

function openNotes() {
  if (studyPackData?.notesUrl && studyPackData.notesUrl !== '#') {
    window.open(studyPackData.notesUrl, '_blank');
    return;
  }
  openPdfPreview(`Learnexa AI Smart Notes\n\n${studyPackData.notesText}\n\nFile: ${studyPackData.fileName}`);
}

function goToFlashcards() {
  window.location.href = 'flashcards.html';
}

function goToQuiz() {
  window.location.href = 'quiz.html';
}

function goToChat(prompt = '') {
  const query = prompt ? `?prompt=${encodeURIComponent(prompt)}` : '';
  window.location.href = `chat.html${query}`;
}

function createFlashcardDeck(data) {
  return data.flashcards && data.flashcards.length > 0 ? [...data.flashcards] : [];
}

function renderFlashcard() {
  const card = flashcardState.cards[flashcardState.activeIndex];
  const cardElement = document.getElementById('flashcardCard');
  const questionElement = document.getElementById('cardQuestion');
  const answerElement = document.getElementById('cardAnswer');
  const progressElement = document.getElementById('flashcardProgress');
  const progressBarElement = document.getElementById('flashcardProgressBar');

  if (!card || !cardElement || !questionElement || !answerElement || !progressElement || !progressBarElement) return;

  questionElement.textContent = card.front;
  answerElement.textContent = card.back;
  progressElement.textContent = `Card ${flashcardState.activeIndex + 1} of ${flashcardState.cards.length}`;
  const progress = ((flashcardState.activeIndex + 1) / flashcardState.cards.length) * 100;
  progressBarElement.style.width = `${progress}%`;
  cardElement.classList.toggle('flipped', flashcardState.isFlipped);
}

function changeFlashcard(delta) {
  if (!flashcardState.cards.length) return;
  flashcardState.activeIndex = Math.max(0, Math.min(flashcardState.cards.length - 1, flashcardState.activeIndex + delta));
  flashcardState.isFlipped = false;
  renderFlashcard();
}

function shuffleFlashcards() {
  if (!flashcardState.cards.length) return;
  flashcardState.cards = flashcardState.cards
    .map((card) => ({ card, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((entry) => entry.card);
  flashcardState.activeIndex = 0;
  flashcardState.isFlipped = false;
  renderFlashcard();
}

function toggleFlashcardFlip() {
  flashcardState.isFlipped = !flashcardState.isFlipped;
  renderFlashcard();
}

function initFlashcards(data) {
  studyPackData = data;
  flashcardState.cards = createFlashcardDeck(data);
  flashcardState.activeIndex = 0;
  flashcardState.isFlipped = false;

  renderFlashcard();

  const cardElement = document.getElementById('flashcardCard');
  const prevButton = document.getElementById('prevFlashcard');
  const nextButton = document.getElementById('nextFlashcard');
  const shuffleButton = document.getElementById('shuffleButton');

  if (cardElement) {
    cardElement.addEventListener('click', toggleFlashcardFlip);
    cardElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleFlashcardFlip();
      }
    });
  }

  if (prevButton) prevButton.addEventListener('click', () => changeFlashcard(-1));
  if (nextButton) nextButton.addEventListener('click', () => changeFlashcard(1));
  if (shuffleButton) shuffleButton.addEventListener('click', shuffleFlashcards);

  document.addEventListener('keydown', (event) => {
    if (document.body.dataset.page !== 'flashcards') return;
    if (event.key === 'ArrowLeft') changeFlashcard(-1);
    if (event.key === 'ArrowRight') changeFlashcard(1);
  });
}

function normalizeAnswer(value) {
  return String(value).trim().toLowerCase();
}

function getQuestionTypeLabel(type) {
  switch (type) {
    case 'truefalse':
      return 'True / False';
    case 'fillblank':
      return 'Fill in the Blanks';
    case 'match':
      return 'Match the Following';
    default:
      return 'Multiple Choice';
  }
}

function getQuestionTypeIcon(type) {
  switch (type) {
    case 'truefalse':
      return '🔘';
    case 'fillblank':
      return '✍️';
    case 'match':
      return '🔗';
    default:
      return '🧠';
  }
}

function updateQuizHeader() {
  const total = quizState.questions.length;
  const current = quizState.currentIndex + 1;
  const questionCounter = document.getElementById('questionCounter');
  const remainingCounter = document.getElementById('remainingCounter');
  const questionType = document.getElementById('questionType');
  const progressElement = document.getElementById('quizProgress');
  const scoreElement = document.getElementById('quizScore');
  const progressBarElement = document.getElementById('quizProgressBar');

  if (questionCounter) {
    questionCounter.textContent = `Question ${current} of ${total}`;
  }
  if (remainingCounter) {
    remainingCounter.textContent = `${Math.max(total - current, 0)} remaining`;
  }
  if (questionType) {
    const currentQuestion = quizState.questions[quizState.currentIndex];
    if (currentQuestion) {
      questionType.textContent = `${getQuestionTypeIcon(currentQuestion.type)} ${getQuestionTypeLabel(currentQuestion.type)}`;
    }
  }
  if (progressElement) {
    progressElement.textContent = `Question ${current} of ${total}`;
  }
  if (scoreElement) {
    const correctCount = Object.values(quizState.selectedAnswers).filter((answer, index) => isAnswerCorrect(quizState.questions[index], answer)).length;
    scoreElement.textContent = `Score: ${correctCount}/${total}`;
  }
  if (progressBarElement) {
    const progress = total ? ((current - 1) / total) * 100 : 0;
    progressBarElement.style.width = `${progress}%`;
  }
}

function isAnswerCorrect(question, answer) {
  if (answer === undefined || answer === null) return false;
  if (question.type === 'mcq' || question.type === 'truefalse') {
    return answer === question.correctAnswer;
  }
  if (question.type === 'fillblank') {
    return normalizeAnswer(answer) === normalizeAnswer(question.correctAnswer);
  }
  if (question.type === 'match') {
    const selected = answer || {};
    return question.pairs.every((pair, index) => normalizeAnswer(selected[index]) === normalizeAnswer(pair.right));
  }
  return false;
}

function formatAnswer(question, answer) {
  if (answer === undefined || answer === null || answer === '') return 'Not answered';
  if (question.type === 'mcq' || question.type === 'truefalse') {
    return question.options[answer] || answer;
  }
  if (question.type === 'fillblank') {
    return answer;
  }
  if (question.type === 'match') {
    return Object.entries(answer)
      .map(([index, value]) => `${question.pairs[index].left} → ${value}`)
      .join(', ');
  }
  return String(answer);
}

function renderMcqOrTrueFalse(question, currentAnswer, isSubmitted) {
  const optionsElement = document.getElementById('quizOptions');
  const feedbackElement = document.getElementById('quizFeedback');
  if (!optionsElement || !feedbackElement) return;

  optionsElement.innerHTML = '';
  const selected = currentAnswer;
  question.options.forEach((option, index) => {
    const optionButton = document.createElement('button');
    optionButton.className = 'quiz-option';
    optionButton.type = 'button';
    optionButton.textContent = option;
    optionButton.dataset.index = index;
    if (selected === index) {
      optionButton.classList.add('selected');
    }
    if (isSubmitted) {
      if (index === question.correctAnswer) {
        optionButton.classList.add('correct');
      }
      if (selected === index && selected !== question.correctAnswer) {
        optionButton.classList.add('incorrect');
      }
      optionButton.disabled = true;
    } else {
      optionButton.addEventListener('click', () => submitAnswer(index));
    }
    optionsElement.appendChild(optionButton);
  });

  if (!isSubmitted) {
    feedbackElement.textContent = 'Choose an option to check your answer.';
  } else {
    const correct = isAnswerCorrect(question, selected);
    feedbackElement.className = `quiz-feedback ${correct ? 'success' : 'error'}`;
    feedbackElement.innerHTML = `<strong>${correct ? 'Correct!' : 'Not quite.'}</strong><br />${question.explanation}`;
  }
}

function renderFillBlank(question, currentAnswer, isSubmitted) {
  const optionsElement = document.getElementById('quizOptions');
  const feedbackElement = document.getElementById('quizFeedback');
  if (!optionsElement || !feedbackElement) return;

  optionsElement.innerHTML = `
    <label class="quiz-pill" for="fillBlankInput">Your answer</label>
    <input id="fillBlankInput" class="quiz-input" type="text" value="${currentAnswer || ''}" ${isSubmitted ? 'disabled' : ''} />
  `;
  const input = document.getElementById('fillBlankInput');
  if (!isSubmitted) {
    feedbackElement.textContent = 'Type your answer and submit it to see the explanation.';
    const button = document.createElement('button');
    button.className = 'feature-button';
    button.type = 'button';
    button.textContent = 'Check Answer';
    button.addEventListener('click', () => {
      const value = input.value.trim();
      if (!value) return;
      submitAnswer(value);
    });
    optionsElement.appendChild(button);
  } else {
    const correct = isAnswerCorrect(question, currentAnswer);
    feedbackElement.className = `quiz-feedback ${correct ? 'success' : 'error'}`;
    feedbackElement.innerHTML = `<strong>${correct ? 'Correct!' : 'Not quite.'}</strong><br />${question.explanation}${correct ? '' : `<br /><strong>Correct answer:</strong> ${question.correctAnswer}`}`;
  }
}

function renderMatch(question, currentAnswer, isSubmitted) {
  const optionsElement = document.getElementById('quizOptions');
  const feedbackElement = document.getElementById('quizFeedback');
  if (!optionsElement || !feedbackElement) return;

  const choices = [...new Set(question.pairs.map((pair) => pair.right))];
  optionsElement.innerHTML = '';

  question.pairs.forEach((pair, index) => {
    const row = document.createElement('div');
    row.className = 'quiz-match-row';
    const label = document.createElement('label');
    label.textContent = pair.left;
    const select = document.createElement('select');
    select.disabled = isSubmitted;
    select.innerHTML = '<option value="">Choose a match</option>';
    choices.forEach((choice) => {
      const option = document.createElement('option');
      option.value = choice;
      option.textContent = choice;
      select.appendChild(option);
    });
    const savedValue = currentAnswer && currentAnswer[index] ? currentAnswer[index] : '';
    select.value = savedValue;
    if (!isSubmitted) {
      select.addEventListener('change', () => {
        const nextAnswers = { ...(quizState.selectedAnswers[quizState.currentIndex] || {}) };
        nextAnswers[index] = select.value;
        quizState.selectedAnswers[quizState.currentIndex] = nextAnswers;
      });
    }
    row.appendChild(label);
    row.appendChild(select);
    optionsElement.appendChild(row);
  });

  if (!isSubmitted) {
    const submitButton = document.createElement('button');
    submitButton.className = 'feature-button';
    submitButton.type = 'button';
    submitButton.textContent = 'Check Matches';
    submitButton.addEventListener('click', () => submitAnswer(currentAnswer || {}));
    optionsElement.appendChild(submitButton);
    feedbackElement.textContent = 'Select a match for each item and submit your answer.';
  } else {
    const correct = isAnswerCorrect(question, currentAnswer);
    feedbackElement.className = `quiz-feedback ${correct ? 'success' : 'error'}`;
    feedbackElement.innerHTML = `<strong>${correct ? 'Great job!' : 'Review the matches below.'}</strong><br />${question.explanation}`;
  }
}

function renderCurrentQuestion() {
  const question = quizState.questions[quizState.currentIndex];
  const questionElement = document.getElementById('quizQuestion');
  const cardElement = document.getElementById('quizCard');
  const resultsElement = document.getElementById('quizResults');
  const reviewElement = document.getElementById('quizReview');
  const prevButton = document.getElementById('prevQuiz');
  const nextButton = document.getElementById('nextQuiz');

  if (!question || !questionElement || !cardElement || !resultsElement || !reviewElement) return;

  resultsElement.classList.add('hidden');
  reviewElement.classList.add('hidden');
  cardElement.classList.remove('hidden');

  questionElement.textContent = question.question;
  updateQuizHeader();

  const currentAnswer = quizState.selectedAnswers[quizState.currentIndex];
  const isSubmitted = Boolean(quizState.submitted[quizState.currentIndex]);

  if (question.type === 'match') {
    renderMatch(question, currentAnswer, isSubmitted);
  } else if (question.type === 'fillblank') {
    renderFillBlank(question, currentAnswer, isSubmitted);
  } else {
    renderMcqOrTrueFalse(question, currentAnswer, isSubmitted);
  }

  if (prevButton) {
    prevButton.style.display = quizState.currentIndex === 0 ? 'none' : 'inline-flex';
  }
  if (nextButton) {
    nextButton.textContent = quizState.currentIndex === quizState.questions.length - 1 ? 'Submit Quiz' : 'Next';
  }
}

function submitAnswer(answer) {
  quizState.selectedAnswers[quizState.currentIndex] = answer;
  quizState.submitted[quizState.currentIndex] = true;
  renderCurrentQuestion();
}

function changeQuiz(delta) {
  if (!quizState.questions.length) return;
  const nextIndex = quizState.currentIndex + delta;
  if (nextIndex < 0 || nextIndex >= quizState.questions.length) return;
  quizState.currentIndex = nextIndex;
  renderCurrentQuestion();
}

function getPerformanceRating(percentage) {
  if (percentage >= 90) return { label: 'Excellent', icon: '🌟' };
  if (percentage >= 75) return { label: 'Great Job', icon: '🎯' };
  if (percentage >= 50) return { label: 'Good Effort', icon: '📚' };
  return { label: 'Keep Practicing', icon: '💪' };
}

function formatTimeTaken(start, end) {
  const diffSeconds = Math.max(1, Math.floor((end - start) / 1000));
  const mins = Math.floor(diffSeconds / 60);
  const secs = diffSeconds % 60;
  return `${mins}m ${secs}s`;
}

function createConfetti() {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 28; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = ['#7ea9ff', '#ec9cd8', '#7ed6c3', '#ffd166'][i % 4];
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    fragment.appendChild(piece);
  }
  document.body.appendChild(fragment);
  setTimeout(() => document.querySelectorAll('.confetti-piece').forEach((node) => node.remove()), 1800);
}

function renderResults() {
  const totalQuestions = quizState.questions.length;
  const correctCount = quizState.questions.reduce((count, question, index) => count + (isAnswerCorrect(question, quizState.selectedAnswers[index]) ? 1 : 0), 0);
  const incorrectCount = totalQuestions - correctCount;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const rating = getPerformanceRating(percentage);
  const resultsElement = document.getElementById('quizResults');
  const cardElement = document.getElementById('quizCard');
  const reviewElement = document.getElementById('quizReview');
  const questionElement = document.getElementById('quizQuestion');

  if (!resultsElement || !cardElement || !reviewElement || !questionElement) return;

  cardElement.classList.add('hidden');
  reviewElement.classList.add('hidden');
  resultsElement.classList.remove('hidden');
  questionElement.textContent = '';

  resultsElement.innerHTML = `
    <div class="quiz-results-card">
      <div class="quiz-results-header">
        <span class="eyebrow">Results</span>
        <div class="quiz-results-title">🎉 Congratulations! You completed the quiz.</div>
        <p class="hero-subtitle">${rating.icon} ${rating.label}</p>
      </div>
      <div class="quiz-results-body">
        <div class="quiz-score-ring" style="--progress: ${percentage};">
          <div class="quiz-score-ring-inner">
            <strong>${percentage}%</strong>
            <span>${correctCount}/${totalQuestions}</span>
          </div>
        </div>
        <div>
          <div class="quiz-metrics">
            <div class="quiz-metric"><span class="label">Final Score</span><span class="value">${correctCount}/${totalQuestions}</span></div>
            <div class="quiz-metric"><span class="label">Correct Answers</span><span class="value">${correctCount}</span></div>
            <div class="quiz-metric"><span class="label">Incorrect Answers</span><span class="value">${incorrectCount}</span></div>
            <div class="quiz-metric"><span class="label">Total Questions</span><span class="value">${totalQuestions}</span></div>
            <div class="quiz-metric"><span class="label">Time Taken</span><span class="value">${formatTimeTaken(quizState.startedAt, quizState.completedAt || Date.now())}</span></div>
            <div class="quiz-metric"><span class="label">Performance</span><span class="value">${rating.label}</span></div>
          </div>
          <div class="quiz-results-actions">
            <button id="retryQuiz" class="feature-button" type="button">Retry Quiz</button>
            <button id="reviewQuiz" class="feature-button" type="button">Review Answers</button>
            <a href="index.html" class="feature-button">Back to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  `;

  const retryButton = document.getElementById('retryQuiz');
  const reviewButton = document.getElementById('reviewQuiz');
  if (retryButton) retryButton.addEventListener('click', retryQuiz);
  if (reviewButton) reviewButton.addEventListener('click', startReviewMode);
  if (percentage >= 90) createConfetti();
}

function startReviewMode() {
  quizState.reviewMode = true;
  quizState.currentIndex = 0;
  renderReview();
}

function renderReview() {
  const reviewElement = document.getElementById('quizReview');
  const cardElement = document.getElementById('quizCard');
  const resultsElement = document.getElementById('quizResults');
  const question = quizState.questions[quizState.currentIndex];
  const prevButton = document.getElementById('prevQuiz');
  const nextButton = document.getElementById('nextQuiz');

  if (!reviewElement || !cardElement || !resultsElement || !question) return;

  cardElement.classList.add('hidden');
  resultsElement.classList.add('hidden');
  reviewElement.classList.remove('hidden');

  const userAnswer = quizState.selectedAnswers[quizState.currentIndex];
  const correct = isAnswerCorrect(question, userAnswer);
  reviewElement.innerHTML = `
    <div class="quiz-review-card">
      <div class="quiz-review-meta">
        <span>Review ${quizState.currentIndex + 1} of ${quizState.questions.length}</span>
        <span>${getQuestionTypeIcon(question.type)} ${getQuestionTypeLabel(question.type)}</span>
      </div>
      <h3>${question.question}</h3>
      <div class="quiz-review-answer ${correct ? 'correct' : 'incorrect'}">
        <strong>Your answer</strong>
        <div>${formatAnswer(question, userAnswer)}</div>
      </div>
      <div class="quiz-review-answer correct">
        <strong>Correct answer</strong>
        <div>${question.type === 'match' ? question.pairs.map((pair) => `${pair.left} → ${pair.right}`).join(', ') : (question.type === 'mcq' || question.type === 'truefalse' ? question.options[question.correctAnswer] : question.correctAnswer)}</div>
      </div>
      <div class="quiz-review-explanation">${question.explanation}</div>
      <div class="quiz-review-nav">
        <button id="reviewPrev" class="feature-button" type="button">Previous</button>
        <button id="reviewNext" class="feature-button" type="button">Next</button>
        <button id="reviewExit" class="feature-button" type="button">Back to Results</button>
      </div>
    </div>
  `;

  const reviewPrevButton = document.getElementById('reviewPrev');
  const reviewNextButton = document.getElementById('reviewNext');
  const reviewExitButton = document.getElementById('reviewExit');
  if (reviewPrevButton) reviewPrevButton.addEventListener('click', () => changeReview(-1));
  if (reviewNextButton) reviewNextButton.addEventListener('click', () => changeReview(1));
  if (reviewExitButton) reviewExitButton.addEventListener('click', renderResults);
  if (prevButton) prevButton.style.display = 'none';
  if (nextButton) nextButton.style.display = 'none';
}

function changeReview(delta) {
  const nextIndex = quizState.currentIndex + delta;
  if (nextIndex < 0 || nextIndex >= quizState.questions.length) return;
  quizState.currentIndex = nextIndex;
  renderReview();
}

function retryQuiz() {
  quizState.currentIndex = 0;
  quizState.selectedAnswers = {};
  quizState.submitted = {};
  quizState.reviewMode = false;
  quizState.startedAt = Date.now();
  quizState.completedAt = null;
  const cardElement = document.getElementById('quizCard');
  const resultsElement = document.getElementById('quizResults');
  const reviewElement = document.getElementById('quizReview');
  if (cardElement) cardElement.classList.remove('hidden');
  if (resultsElement) resultsElement.classList.add('hidden');
  if (reviewElement) reviewElement.classList.add('hidden');
  renderCurrentQuestion();
}

function initQuiz(data) {
  studyPackData = data;
  quizState.questions = data.quizItems;
  quizState.currentIndex = 0;
  quizState.selectedAnswers = {};
  quizState.submitted = {};
  quizState.reviewMode = false;
  quizState.startedAt = Date.now();
  quizState.completedAt = null;

  const prevButton = document.getElementById('prevQuiz');
  const nextButton = document.getElementById('nextQuiz');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (quizState.reviewMode) {
        changeReview(-1);
      } else {
        changeQuiz(-1);
      }
    });
  }
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (quizState.reviewMode) {
        changeReview(1);
      } else if (quizState.currentIndex === quizState.questions.length - 1) {
        quizState.completedAt = Date.now();
        renderResults();
      } else {
        changeQuiz(1);
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (document.body.dataset.page !== 'quiz') return;
    if (event.key === 'ArrowLeft') {
      if (quizState.reviewMode) {
        changeReview(-1);
      } else {
        changeQuiz(-1);
      }
    }
    if (event.key === 'ArrowRight') {
      if (quizState.reviewMode) {
        changeReview(1);
      } else if (quizState.currentIndex === quizState.questions.length - 1) {
        quizState.completedAt = Date.now();
        renderResults();
      } else {
        changeQuiz(1);
      }
    }
  });

  renderCurrentQuestion();
}

function appendChatMessage(role, text, isTyping = false) {
  const history = document.getElementById('chatHistory');
  if (!history) return null;
  const wrapper = document.createElement('div');
  wrapper.className = `chat-message ${role}`;
  if (isTyping) {
    wrapper.classList.add('typing');
    wrapper.innerHTML = '<span></span><span></span><span></span>';
  } else {
    wrapper.innerHTML = `<p>${text}</p>`;
  }
  history.appendChild(wrapper);
  history.scrollTop = history.scrollHeight;
  return wrapper;
}

function getAssistantResponse(message) {
  const normalized = message.toLowerCase();
  if (normalized.includes('summary')) return 'Your summary is a quick way to revisit the main concepts clearly.';
  if (normalized.includes('notes')) return 'The smart notes section highlights definitions, examples, and key ideas for review.';
  if (normalized.includes('flashcard')) return 'Use flashcards to flip between question and answer, then shuffle to keep recall fresh.';
  if (normalized.includes('quiz')) return 'The quiz gives instant feedback and tracks your score as you progress through questions.';
  return 'This is a placeholder response from Learnexa AI. A real assistant can be connected later.';
}

function getChatPromptFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('prompt') || '';
}

function initChat(data) {
  studyPackData = data;
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const initialPrompt = getChatPromptFromQuery();

  appendChatMessage('assistant', 'Hi! Ask me anything about your study pack.');

  if (!form || !input) return;

  if (initialPrompt) {
    input.value = initialPrompt;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    appendChatMessage('user', message);
    input.value = '';
    const typingIndicator = appendChatMessage('assistant', '', true);

    setTimeout(() => {
      if (typingIndicator && typingIndicator.classList.contains('typing')) {
        typingIndicator.remove();
      }
      appendChatMessage('assistant', getAssistantResponse(message));
    }, 900);
  });
}

function setTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.classList.toggle('light-mode', nextTheme === 'light');
  document.documentElement.classList.toggle('dark-mode', nextTheme === 'dark');
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.textContent = nextTheme === 'light' ? 'Dark mode' : 'Light mode';
    toggle.setAttribute('aria-pressed', nextTheme === 'dark' ? 'false' : 'true');
  }
  localStorage.setItem('learnexaTheme', nextTheme);
}

function toggleTheme() {
  const current = localStorage.getItem('learnexaTheme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function initializeTheme() {
  const storedTheme = localStorage.getItem('learnexaTheme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(initialTheme);
}

document.addEventListener('DOMContentLoaded', async () => {
  const data = await getStudyPackData();
  const page = document.body.dataset.page;
  if (page === 'dashboard') populateDashboard(data);
  if (page === 'flashcards') initFlashcards(data);
  if (page === 'quiz') initQuiz(data);
  if (page === 'chat') initChat(data);
  initializeTheme();
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', toggleTheme);
  }
});
