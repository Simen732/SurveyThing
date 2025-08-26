// Survey creator functionality
let questionCounter = 0;

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateSurveyForm()) {
                serializeQuestions();
                form.submit();
            }
        });
    }
    
    // Add first question automatically
    addQuestion();
});

function addQuestion() {
    questionCounter++;
    
    const questionHTML = `
        <div class="card question-card mb-3" data-question-id="${questionCounter}">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Question ${questionCounter}</h6>
                <div>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeQuestion(${questionCounter})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">Question Text *</label>
                    <textarea class="form-control question-text" rows="2" 
                              placeholder="Enter your question..." required></textarea>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Question Type *</label>
                    <select class="form-select question-type" onchange="updateQuestionOptions(${questionCounter})" required>
                        <option value="">Select question type</option>
                        <option value="rating">Rating Scale (1-5 stars)</option>
                        <option value="multiple-choice">Multiple Choice</option>
                    </select>
                </div>
                
                <div class="options-container" id="options-${questionCounter}" style="display: none;">
                    <label class="form-label">Answer Options</label>
                    <div class="options-list">
                        <div class="input-group mb-2">
                            <input type="text" class="form-control option-text" placeholder="Option 1">
                            <button type="button" class="btn btn-outline-danger" onclick="removeOption(this)">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control option-text" placeholder="Option 2">
                            <button type="button" class="btn btn-outline-danger" onclick="removeOption(this)">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="addOption(${questionCounter})">
                        <i class="fas fa-plus me-1"></i>Add Option
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('questionsContainer').insertAdjacentHTML('beforeend', questionHTML);
    updateQuestionNumbers();
}

function removeQuestion(questionId) {
    const questionCard = document.querySelector(`[data-question-id="${questionId}"]`);
    if (questionCard) {
        // Check if it's the last question
        const questionCards = document.querySelectorAll('.question-card');
        if (questionCards.length <= 1) {
            alert('You must have at least one question in your survey.');
            return;
        }
        
        questionCard.remove();
        updateQuestionNumbers();
    }
}

function updateQuestionOptions(questionId) {
    const questionCard = document.querySelector(`[data-question-id="${questionId}"]`);
    const typeSelect = questionCard.querySelector('.question-type');
    const optionsContainer = questionCard.querySelector('.options-container');
    
    if (typeSelect.value === 'multiple-choice') {
        optionsContainer.style.display = 'block';
        // Make options required
        const optionInputs = optionsContainer.querySelectorAll('.option-text');
        optionInputs.forEach(input => input.required = true);
    } else {
        optionsContainer.style.display = 'none';
        // Remove required attribute
        const optionInputs = optionsContainer.querySelectorAll('.option-text');
        optionInputs.forEach(input => input.required = false);
    }
}

function addOption(questionId) {
    const optionsList = document.querySelector(`#options-${questionId} .options-list`);
    const optionCount = optionsList.querySelectorAll('.input-group').length + 1;
    
    const optionHTML = `
        <div class="input-group mb-2">
            <input type="text" class="form-control option-text" placeholder="Option ${optionCount}" required>
            <button type="button" class="btn btn-outline-danger" onclick="removeOption(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    optionsList.insertAdjacentHTML('beforeend', optionHTML);
}

function removeOption(button) {
    const inputGroup = button.closest('.input-group');
    const optionsList = inputGroup.closest('.options-list');
    
    // Don't allow removal if only 2 options left
    if (optionsList.querySelectorAll('.input-group').length <= 2) {
        alert('Multiple choice questions must have at least 2 options.');
        return;
    }
    
    inputGroup.remove();
}

function updateQuestionNumbers() {
    const questionCards = document.querySelectorAll('.question-card');
    questionCards.forEach((card, index) => {
        const header = card.querySelector('.card-header h6');
        header.textContent = `Question ${index + 1}`;
    });
}

function validateSurveyForm() {
    const title = document.getElementById('title').value.trim();
    if (!title) {
        alert('Please enter a survey title.');
        document.getElementById('title').focus();
        return false;
    }
    
    const questionCards = document.querySelectorAll('.question-card');
    if (questionCards.length === 0) {
        alert('Please add at least one question to your survey.');
        return false;
    }
    
    for (let i = 0; i < questionCards.length; i++) {
        const card = questionCards[i];
        const questionText = card.querySelector('.question-text').value.trim();
        const questionType = card.querySelector('.question-type').value;
        
        if (!questionText) {
            alert(`Please enter text for question ${i + 1}.`);
            card.querySelector('.question-text').focus();
            return false;
        }
        
        if (!questionType) {
            alert(`Please select a type for question ${i + 1}.`);
            card.querySelector('.question-type').focus();
            return false;
        }
        
        if (questionType === 'multiple-choice') {
            const options = card.querySelectorAll('.option-text');
            const filledOptions = Array.from(options).filter(opt => opt.value.trim());
            
            if (filledOptions.length < 2) {
                alert(`Question ${i + 1} must have at least 2 answer options.`);
                return false;
            }
            
            // Check for duplicate options
            const optionTexts = filledOptions.map(opt => opt.value.trim().toLowerCase());
            const uniqueOptions = [...new Set(optionTexts)];
            
            if (optionTexts.length !== uniqueOptions.length) {
                alert(`Question ${i + 1} has duplicate answer options.`);
                return false;
            }
        }
    }
    
    return true;
}

function serializeQuestions() {
    const questionCards = document.querySelectorAll('.question-card');
    const questions = [];
    
    questionCards.forEach((card, index) => {
        const questionText = card.querySelector('.question-text').value.trim();
        const questionType = card.querySelector('.question-type').value;
        
        const question = {
            text: questionText,
            type: questionType,
            order: index + 1,
            options: []
        };
        
        if (questionType === 'multiple-choice') {
            const options = card.querySelectorAll('.option-text');
            options.forEach((option, optIndex) => {
                const text = option.value.trim();
                if (text) {
                    question.options.push({
                        text: text,
                        value: `option_${optIndex + 1}`
                    });
                }
            });
        }
        
        questions.push(question);
    });
    
    document.getElementById('questionsData').value = JSON.stringify(questions);
}