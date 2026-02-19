const state = {
    currentStep: 1,
    formData: {
        firmSize: '',
        sector: '',
        services: [],
        aiType: '',
        autonomy: ''
    }
};

const steps = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4')
};

const progressSteps = document.querySelectorAll('.progress-step');

function nextStep(currentStepNum) {
    if (!validateStep(currentStepNum)) return;
    
    saveStepData(currentStepNum);
    
    steps[currentStepNum].classList.remove('active');
    steps[currentStepNum].hidden = true;
    
    const nextStepNum = currentStepNum + 1;
    steps[nextStepNum].classList.add('active');
    steps[nextStepNum].hidden = false;
    
    updateProgress(nextStepNum);
    
    if (progressSteps[currentStepNum - 1]) {
        progressSteps[currentStepNum - 1].classList.remove('active');
        progressSteps[currentStepNum - 1].classList.add('completed');
    }
    
    state.currentStep = nextStepNum;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(currentStepNum) {
    const prevStepNum = currentStepNum - 1;
    
    steps[currentStepNum].classList.remove('active');
    steps[currentStepNum].hidden = true;
    
    steps[prevStepNum].classList.add('active');
    steps[prevStepNum].hidden = false;
    
    updateProgress(prevStepNum);
    
    if (progressSteps[currentStepNum - 1]) {
        progressSteps[currentStepNum - 1].classList.remove('completed');
        progressSteps[currentStepNum - 1].classList.remove('active');
    }
    
    if (progressSteps[prevStepNum - 1]) {
        progressSteps[prevStepNum - 1].classList.remove('completed');
        progressSteps[prevStepNum - 1].classList.add('active');
    }
    
    state.currentStep = prevStepNum;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(stepNum) {
    progressSteps.forEach((step, index) => {
        const stepIndex = index + 1;
        step.classList.remove('active');
        
        if (stepIndex === stepNum) {
            step.classList.add('active');
        } else if (stepIndex < stepNum) {
            step.classList.add('completed');
        }
    });
    
    const progressContainer = document.querySelector('.progress-container');
    if (progressContainer) {
        progressContainer.setAttribute('aria-valuenow', stepNum);
    }
}

function validateStep(stepNum) {
    let isValid = true;
    let errorMessage = '';
    
    switch(stepNum) {
        case 1:
            const firmSize = document.getElementById('firm-size').value;
            const sector = document.querySelector('input[name="sector"]:checked');
            
            if (!firmSize) {
                isValid = false;
                errorMessage = 'Please select your organization size.';
            } else if (!sector) {
                isValid = false;
                errorMessage = 'Please select your primary sector.';
            }
            break;
            
        case 3:
            const aiType = document.querySelector('input[name="ai-type"]:checked');
            const autonomy = document.querySelector('input[name="autonomy"]:checked');
            
            if (!aiType) {
                isValid = false;
                errorMessage = 'Please specify your AI system category.';
            } else if (!autonomy) {
                isValid = false;
                errorMessage = 'Please specify the decision-making autonomy level.';
            }
            break;
    }
    
    if (!isValid) {
        showValidationError(errorMessage);
    }
    
    return isValid;
}

function showValidationError(message) {
    const existingError = document.querySelector('.validation-error');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.style.cssText = `
        background-color: rgba(220, 38, 38, 0.1);
        color: #dc2626;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border-left: 4px solid #dc2626;
        font-weight: 500;
    `;
    errorDiv.textContent = message;
    
    const currentStepEl = steps[state.currentStep];
    const stepHeader = currentStepEl.querySelector('.step-header');
    stepHeader.insertAdjacentElement('afterend', errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function saveStepData(stepNum) {
    switch(stepNum) {
        case 1:
            state.formData.firmSize = document.getElementById('firm-size').value;
            state.formData.sector = document.querySelector('input[name="sector"]:checked')?.value;
            break;
            
        case 2:
            const services = document.querySelectorAll('input[name="services"]:checked');
            state.formData.services = Array.from(services).map(cb => cb.value);
            break;
            
        case 3:
            state.formData.aiType = document.querySelector('input[name="ai-type"]:checked')?.value;
            state.formData.autonomy = document.querySelector('input[name="autonomy"]:checked')?.value;
            break;
    }
}

function calculateRisk() {
    if (!validateStep(3)) return;
    saveStepData(3);
    
    const { services, aiType, autonomy } = state.formData;
    let riskTier = 'minimal';
    let riskCategory = 'Minimal Risk';
    
    const highRiskServices = ['biometric', 'automated-decision', 'risk-assessment'];
    const hasHighRiskService = services.some(s => highRiskServices.includes(s));
    
    if (aiType === 'prohibited') {
        riskTier = 'high';
        riskCategory = 'Prohibited Practice or High Risk';
    } else if (hasHighRiskService && autonomy === 'automated') {
        riskTier = 'high';
        riskCategory = 'High-Risk AI System';
    } else if (hasHighRiskService || (aiType === 'specialized' && autonomy === 'automated')) {
        riskTier = 'high';
        riskCategory = 'High-Risk AI System';
    } else if (services.includes('content-generation') && autonomy === 'automated') {
        riskTier = 'limited';
        riskCategory = 'Limited Risk (Transparency Required)';
    } else if (aiType === 'specialized' || services.length > 2) {
        riskTier = 'limited';
        riskCategory = 'Limited Risk';
    } else if (aiType === 'general' && autonomy !== 'automated') {
        riskTier = 'minimal';
        riskCategory = 'Minimal Risk';
    } else if (aiType === 'none') {
        riskTier = 'minimal';
        riskCategory = 'Minimal Risk (Preventive)';
    } else {
        riskTier = 'limited';
        riskCategory = 'Limited Risk';
    }
    
    displayResults(riskTier, riskCategory);
    
    steps[3].classList.remove('active');
    steps[3].hidden = true;
    steps[4].classList.add('active');
    steps[4].hidden = false;
    updateProgress(4);
    state.currentStep = 4;
    
    updateCountdown();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function displayResults(tier, category) {
    const badge = document.getElementById('risk-badge');
    const level = document.getElementById('risk-level');
    const cat = document.getElementById('risk-category');
    const legalText = document.getElementById('legal-meaning-text');
    const obligationsList = document.getElementById('obligations-list');
    const governanceText = document.getElementById('governance-text');
    const strategicText = document.getElementById('strategic-text');
    
    badge.className = `risk-badge ${tier}`;
    level.textContent = tier === 'minimal' ? 'Minimal Risk' : 
                       tier === 'limited' ? 'Limited Risk' : 'High Risk';
    cat.textContent = category;
    
    const content = getRiskContent(tier);
    
    legalText.textContent = content.legal;
    governanceText.textContent = content.governance;
    strategicText.textContent = content.strategic;
    
    obligationsList.innerHTML = '';
    content.obligations.forEach(obligation => {
        const li = document.createElement('li');
        li.textContent = obligation;
        obligationsList.appendChild(li);
    });
}

function getRiskContent(tier) {
    const contents = {
        minimal: {
            legal: 'Your AI deployment falls under the minimal risk category per Article 6 of Regulation (EU) 2024/1689. You are not subject to high-risk system obligations but must comply with basic transparency requirements (Article 52) if utilizing chatbots or AI-generated content.',
            obligations: [
                'Transparency obligations regarding AI interaction (chatbots, deepfakes)',
                'Copyright and training data compliance',
                'Internal AI usage documentation',
                'Regulatory monitoring for future amendments'
            ],
            governance: 'Low governance exposure. No conformity assessment required. However, management must ensure AI usage remains within this category and does not migrate to high-risk applications without board authorization.',
            strategic: 'Recommended: Utilize this period to establish voluntary ethical governance. Anticipate regulatory evolution through process documentation. This is the optimal window to structure AI policy before obligations intensify.'
        },
        limited: {
            legal: 'Your exposure is classified as limited risk (Article 52). You likely utilize General Purpose AI (GPAI) or specialized tools with human oversight. Transparency obligations apply, particularly regarding user notification and documentation of system capabilities and limitations.',
            obligations: [
                'Clear notification to users regarding AI interaction',
                'Technical documentation of deployed systems',
                'Labeling of AI-generated content (deepfakes, text)',
                'Implementation of effective human oversight',
                'Fundamental rights impact assessment'
            ],
            governance: 'Moderate board-level exposure. Management must validate use cases and ensure traceability. A compliance officer should be designated, even formally. AI tool procurement requires systematic legal review.',
            strategic: 'Structuring opportunity. You are positioned where proactive governance investment becomes competitive advantage. Clients increasingly demand compliance evidence. Structure now to avoid urgent compliance costs later.'
        },
        high: {
            legal: 'REGULATORY ALERT: You are likely subject to high-risk AI systems (Article 6 and Annex III). This includes biometric systems, risk assessments for access to essential services, or automated decision-making with significant legal impact. Strict pre-market obligations apply.',
            obligations: [
                'Conformity assessment mandatory prior to deployment',
                'Quality management and documentation system',
                'Meaningful human oversight (human-in-the-loop)',
                'Transparency and information provision to users',
                'Registration in EU AI database',
                'Incident management and non-conformity remediation',
                'Log retention minimum 6 months'
            ],
            governance: 'CRITICAL BOARD-LEVEL EXPOSURE. Directors face personal liability for non-compliance. Mandatory robust governance system with compliance officer, regular internal audits, and mandatory quarterly board review. Civil liability exposure is significant.',
            strategic: 'IMMEDIATE ACTION REQUIRED. You must allocate significant resources for compliance before August 2026. Non-compliance exposes to penalties up to 7% global turnover. However, demonstrable compliance becomes major competitive advantage against unprepared competitors.'
        }
    };
    
    return contents[tier] || contents.minimal;
}

function updateCountdown() {
    const targetDate = new Date('2026-08-02T00:00:00');
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) {
            countdownEl.textContent = `${months} months and ${remainingDays} days remaining`;
        }
    }
}

function resetAssessment() {
    state.currentStep = 1;
    state.formData = {
        firmSize: '',
        sector: '',
        services: [],
        aiType: '',
        autonomy: ''
    };
    
    document.getElementById('firm-size').value = '';
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    
    progressSteps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) step.classList.add('active');
    });
    
    Object.values(steps).forEach((step, index) => {
        step.classList.remove('active');
        step.hidden = index !== 0;
        if (index === 0) step.classList.add('active');
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function() {
    updateProgress(1);
    
    document.querySelectorAll('.assessment-step').forEach(step => {
        step.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                const currentStepNum = parseInt(step.id.split('-')[1]);
                if (currentStepNum < 4) {
                    nextStep(currentStepNum);
                }
            }
        });
    });
});
