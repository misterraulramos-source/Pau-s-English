// ==========================================
// VARIABLES DE ESTADO Y REFERENCIAS DOM
// ==========================================
let currentLessonData = null;
let currentQuestionIndex = 0;
let score = 0;

// Vistas
const menuView = document.getElementById('menu-view');
const lessonView = document.getElementById('lesson-view');

// Contenedores de contenido
const lessonTitle = document.getElementById('lesson-title');
const lessonTheory = document.getElementById('lesson-theory');
const lessonQuiz = document.getElementById('lesson-quiz');
const questionContainer = document.getElementById('question-container');
const lessonResults = document.getElementById('lesson-results');

// Botones y UI
const btnBack = document.getElementById('btn-back');
const btnStartQuiz = document.getElementById('btn-start-quiz');
const btnNext = document.getElementById('btn-next');
const btnFinish = document.getElementById('btn-finish');
const progressFill = document.getElementById('progress-fill');
const questionCounter = document.getElementById('question-counter');
const scoreText = document.getElementById('score-text');
const lessonsGrid = document.getElementById('lessons-grid');

// ==========================================
// CATÁLOGO DE LECCIONES
// ==========================================
const availableLessons = [
    {
        id: 'lesson1',
        title: 'Present Simple vs Present Continuous',
        description: 'Learn when to use routines and when to talk about right now or future plans.',
        file: 'data/lesson1.json'
    },
    {
        id: 'lesson2',
        title: 'Adverbs of Manner',
        description: 'Master how to use good, well, hard, fast, slowly and more.',
        file: 'data/lesson2.json'
    }
];

// ==========================================
// INICIALIZACIÓN
// ==========================================
function initApp() {
    renderMenu();
    setupEventListeners();
}

function renderMenu() {
    lessonsGrid.innerHTML = '';
    
    availableLessons.forEach(lesson => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.innerHTML = `
            <h3>${lesson.title}</h3>
            <p>${lesson.description}</p>
        `;
        card.addEventListener('click', () => loadLesson(lesson.file));
        lessonsGrid.appendChild(card);
    });
}

function setupEventListeners() {
    btnBack.addEventListener('click', showMenu);
    btnStartQuiz.addEventListener('click', startQuiz);
    btnNext.addEventListener('click', loadNextQuestion);
    btnFinish.addEventListener('click', showMenu);
}

// ==========================================
// NAVEGACIÓN Y CARGA DE DATOS
// ==========================================
async function loadLesson(jsonFile) {
    try {
        const response = await fetch(jsonFile);
        if (!response.ok) throw new Error('Error loading lesson data');
        
        currentLessonData = await response.json();
        
        lessonTitle.textContent = currentLessonData.title;
        lessonTheory.innerHTML = currentLessonData.theoryHTML;
        
        lessonTheory.classList.remove('hidden');
        btnStartQuiz.classList.remove('hidden');
        lessonQuiz.classList.add('hidden');
        lessonResults.classList.add('hidden');
        
        menuView.classList.remove('active');
        menuView.classList.add('hidden');
        lessonView.classList.remove('hidden');
        lessonView.classList.add('active');
        
    } catch (error) {
        console.error("Error:", error);
        alert("Sorry! Could not load the lesson. Ensure you are running this on a local server.");
    }
}

function showMenu() {
    lessonView.classList.remove('active');
    lessonView.classList.add('hidden');
    menuView.classList.remove('hidden');
    menuView.classList.add('active');
    currentLessonData = null;
}

// ==========================================
// LÓGICA DEL CUESTIONARIO
// ==========================================
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    
    lessonTheory.classList.add('hidden');
    btnStartQuiz.classList.add('hidden');
    lessonQuiz.classList.remove('hidden');
    
    renderQuestion();
}

function renderQuestion() {
    const question = currentLessonData.questions[currentQuestionIndex];
    const totalQuestions = currentLessonData.questions.length;
    
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} / ${totalQuestions}`;
    progressFill.style.width = `${((currentQuestionIndex) / totalQuestions) * 100}%`;
    btnNext.disabled = true;
    
    let html = `<div class="question-text">${question.text}</div>`;
    html += `<div class="options-container">`;
    
    question.options.forEach((opt, index) => {
        html += `<button class="option-btn" data-index="${index}">${opt}</button>`;
    });
    
    html += `</div>`;
    questionContainer.innerHTML = html;
    
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => selectAnswer(e, question.correctAnswer));
    });
}

function selectAnswer(event, correctAnswerIndex) {
    const allButtons = document.querySelectorAll('.option-btn');
    if (allButtons[0].disabled) return;
    
    const selectedBtn = event.target;
    const selectedIndex = parseInt(selectedBtn.getAttribute('data-index'));
    
    allButtons.forEach(btn => {
        btn.disabled = true;
        const btnIndex = parseInt(btn.getAttribute('data-index'));
        
        if (btnIndex === correctAnswerIndex) {
            btn.classList.add('correct');
        } else if (btnIndex === selectedIndex) {
            btn.classList.add('wrong');
        }
    });
    
    if (selectedIndex === correctAnswerIndex) {
        score++;
    }

    // Mostrar explicación
    const oldExp = document.getElementById('explanation-box');
    if (oldExp) oldExp.remove();
    
    const explanationDiv = document.createElement('div');
    explanationDiv.id = 'explanation-box';
    
    const isCorrect = selectedIndex === correctAnswerIndex;
    explanationDiv.className = isCorrect ? 'explanation-box correct-box' : 'explanation-box wrong-box';
    
    const currentQuestion = currentLessonData.questions[currentQuestionIndex];
    explanationDiv.innerHTML = `<strong>${isCorrect ? 'Correct! 🌟' : 'Review this! 💡'}</strong><br>${currentQuestion.explanation}`;
    
    document.querySelector('.options-container').appendChild(explanationDiv);
    
    btnNext.disabled = false;
}

function loadNextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentLessonData.questions.length) {
        renderQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    lessonQuiz.classList.add('hidden');
    lessonResults.classList.remove('hidden');
    
    const totalQuestions = currentLessonData.questions.length;
    progressFill.style.width = '100%';
    
    scoreText.innerHTML = `You scored <strong>${score}</strong> out of ${totalQuestions}!<br>`;
    
    if (score === totalQuestions) {
        scoreText.innerHTML += "Perfect! You are a master! 🏆";
    } else if (score >= totalQuestions * 0.7) {
        scoreText.innerHTML += "Great job! Keep it up! ⭐";
    } else {
        scoreText.innerHTML += "Good effort! Try again to improve! 💪";
    }
}

document.addEventListener('DOMContentLoaded', initApp);