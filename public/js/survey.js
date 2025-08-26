// Survey taking functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    if (form) {
        // Add progress indicator
        addProgressIndicator();
        
        // Handle form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                // Show confirmation before submitting
                showSubmitConfirmation();
            }
        });

        // Add visual feedback for rating selections
        const ratingInputs = document.querySelectorAll('input[type="radio"]');
        ratingInputs.forEach(input => {
            input.addEventListener('change', function() {
                updateProgress();
                
                // Visual feedback for rating scales
                if (this.name.includes('question_')) {
                    const group = document.querySelector(`input[name="${this.name}"]`).closest('.rating-group, .options-container');
                    if (group) {
                        group.classList.add('answered');
                    }
                }
            });
        });
    }
});

function addProgressIndicator() {
    const form = document.getElementById('surveyForm');
    const questions = form.querySelectorAll('.question-container');
    
    if (questions.length > 1) {
        const progressHTML = `
            <div class="progress mb-4" style="height: 10px;">
                <div class="progress-bar" role="progressbar" style="width: 0%"></div>
            </div>
            <div class="text-center mb-4">
                <small class="text-muted">
                    <span id="current-question">0</span> of ${questions.length} questions completed
                </small>
            </div>
        `;
        
        form.insertAdjacentHTML('afterbegin', progressHTML);
    }
}

function updateProgress() {
    const form = document.getElementById('surveyForm');
    const questions = form.querySelectorAll('.question-container');
    const answeredQuestions = form.querySelectorAll('input[type="radio"]:checked');
    const uniqueQuestions = new Set();
    
    answeredQuestions.forEach(input => {
        uniqueQuestions.add(input.name);
    });
    
    const progress = (uniqueQuestions.size / questions.length) * 100;
    const progressBar = form.querySelector('.progress-bar');
    const currentQuestion = form.querySelector('#current-question');
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', progress);
    }
    
    if (currentQuestion) {
        currentQuestion.textContent = uniqueQuestions.size;
    }
}

function validateForm() {
    const form = document.getElementById('surveyForm');
    const questions = form.querySelectorAll('.question-container');
    const unansweredQuestions = [];
    
    questions.forEach((question, index) => {
        const inputs = question.querySelectorAll('input[type="radio"]');
        const isAnswered = Array.from(inputs).some(input => input.checked);
        
        if (!isAnswered) {
            unansweredQuestions.push(index + 1);
            question.classList.add('border-danger');
        } else {
            question.classList.remove('border-danger');
        }
    });
    
    if (unansweredQuestions.length > 0) {
        showValidationError(`Please answer question${unansweredQuestions.length > 1 ? 's' : ''} ${unansweredQuestions.join(', ')}.`);
        
        // Scroll to first unanswered question
        const firstUnanswered = document.querySelector('.question-container.border-danger');
        if (firstUnanswered) {
            firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return false;
    }
    
    return true;
}

function showValidationError(message) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.validation-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alertHTML = `
        <div class="alert alert-danger validation-alert" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
        </div>
    `;
    
    const form = document.getElementById('surveyForm');
    form.insertAdjacentHTML('afterbegin', alertHTML);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        const alert = document.querySelector('.validation-alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

function showSubmitConfirmation() {
    const confirmationHTML = `
        <div class="modal fade" id="submitModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-paper-plane me-2"></i>
                            Submit Survey
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to submit your responses?</p>
                        <p class="text-muted small">
                            <i class="fas fa-info-circle me-1"></i>
                            Once submitted, you cannot modify your answers.
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cancel
                        </button>
                        <button type="button" class="btn btn-primary" onclick="submitSurvey()">
                            <i class="fas fa-check me-2"></i>Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
    const modal = new bootstrap.Modal(document.getElementById('submitModal'));
    modal.show();
    
    // Clean up modal after it's hidden
    document.getElementById('submitModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function submitSurvey() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('submitModal'));
    modal.hide();
    
    const form = document.getElementById('surveyForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
    }
    
    form.submit();
}

// Add CSS for number rating styles
const style = document.createElement('style');
style.textContent = `
/* Number Rating Styles */
.number-rating {
    display: flex;
    gap: 10px;
}

.number-rating input[type="radio"] {
    display: none;
}

.number-label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 2px solid #dee2e6;
    border-radius: 50%;
    background-color: #fff;
    color: #6c757d;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
}

.number-label:hover {
    border-color: #0d6efd;
    color: #0d6efd;
    background-color: #f8f9ff;
}

.number-rating input[type="radio"]:checked + .number-label {
    background-color: #0d6efd;
    border-color: #0d6efd;
    color: white;
}
`;

document.head.appendChild(style);