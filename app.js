// Initialize EmailJS
// IMPORTANT: Replace these with your actual EmailJS credentials from https://www.emailjs.com/
// 1. Sign up at EmailJS
// 2. Create an email service (Gmail recommended)
// 3. Create an email template
// 4. Get your Public Key from Account settings
const EMAILJS_PUBLIC_KEY = 'qImZcSAc8okbVxK1e'; // Replace with your EmailJS public key
const EMAILJS_SERVICE_ID = 'service_x0x99fk'; // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'template_un5v89c'; // Replace with your EmailJS template ID

// Initialize EmailJS with public key
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

// State management - Store activities and schedule in memory
let activityIdCounter = 0;
const scheduleData = {
    dec4: [],
    dec5: [],
    dec6: []
};

// DOM Elements
const activityInput = document.getElementById('activity-input');
const addActivityBtn = document.getElementById('add-activity-btn');
const activitiesList = document.getElementById('activities-list');
const dropZones = document.querySelectorAll('.drop-zone');

// Add Activity Functionality
addActivityBtn.addEventListener('click', addActivity);
activityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addActivity();
    }
});

function addActivity() {
    const activityName = activityInput.value.trim();
    
    if (!activityName) {
        alert('Please enter an activity name!');
        return;
    }
    
    const activityCard = createActivityCard(activityName, activityIdCounter++);
    activitiesList.appendChild(activityCard);
    activityInput.value = '';
    activityInput.focus();
}

function createActivityCard(name, id) {
    const card = document.createElement('div');
    card.className = 'activity-card';
    card.draggable = true;
    card.dataset.activityId = id;
    card.dataset.activityName = name;
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.remove();
    });
    
    card.appendChild(nameSpan);
    card.appendChild(removeBtn);
    
    // Drag event listeners
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    
    return card;
}

// Drag and Drop Handlers
function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', e.target.dataset.activityName);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// Setup drop zones
dropZones.forEach(zone => {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('dragenter', handleDragEnter);
    zone.addEventListener('dragleave', handleDragLeave);
    zone.addEventListener('drop', handleDrop);
});

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

function handleDragEnter(e) {
    e.preventDefault();
    if (e.target.classList.contains('drop-zone')) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('drop-zone')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    
    const dropZone = e.target.closest('.drop-zone');
    if (!dropZone) return;
    
    dropZone.classList.remove('drag-over');
    
    const activityName = e.dataTransfer.getData('text/plain');
    const dayId = dropZone.dataset.day;
    
    if (activityName) {
        addActivityToDay(dayId, activityName);
    }
}

function addActivityToDay(dayId, activityName) {
    // Add to data structure
    scheduleData[dayId].push(activityName);
    
    // Create dropped activity element
    const droppedActivity = document.createElement('div');
    droppedActivity.className = 'dropped-activity';
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = activityName;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', () => {
        // Remove from data structure
        const index = scheduleData[dayId].indexOf(activityName);
        if (index > -1) {
            scheduleData[dayId].splice(index, 1);
        }
        droppedActivity.remove();
    });
    
    droppedActivity.appendChild(nameSpan);
    droppedActivity.appendChild(removeBtn);
    
    // Add to drop zone
    const dropZone = document.querySelector(`.drop-zone[data-day="${dayId}"]`);
    dropZone.appendChild(droppedActivity);
}

// Form submission
const form = document.getElementById('itinerary-form');
const submitBtn = document.querySelector('.submit-btn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const notes = document.getElementById('additional-notes').value;
    
    // Check if at least one day has activities
    const hasActivities = scheduleData.dec4.length > 0 || 
                          scheduleData.dec5.length > 0 || 
                          scheduleData.dec6.length > 0;
    
    if (!hasActivities) {
        alert('Please add activities to at least one day before submitting!');
        return;
    }
    
    // Disable submit button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    
    // Format itinerary for email
    const formattedItinerary = formatItineraryForEmail();
    
    // Prepare email parameters
    const emailParams = {
        to_email: 'deadlymouse15@gmail.com',
        subject: `Birthday Itinerary Submission - ${new Date().toLocaleDateString()}`,
        message: formattedItinerary,
        additional_notes: notes || 'No additional notes provided',
        day1_activities: scheduleData.dec4.length > 0 ? scheduleData.dec4.join('\n') : 'No activities planned',
        day2_activities: scheduleData.dec5.length > 0 ? scheduleData.dec5.join('\n') : 'No activities planned',
        day3_activities: scheduleData.dec6.length > 0 ? scheduleData.dec6.join('\n') : 'No activities planned'
    };
    
    try {
        // Check if EmailJS is configured
        if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY_HERE' || 
            EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID_HERE' || 
            EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID_HERE') {
            
            // Demo mode - show success without actually sending
            console.log('EmailJS not configured. Email content:', emailParams);
            setTimeout(() => {
                showSuccessMessage();
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit My Birthday Plans! 💝';
            }, 1000);
            
            alert('Demo Mode: EmailJS is not configured. In production, configure EmailJS credentials in app.js to send real emails.\n\nItinerary would be sent to: nicholasloww2002@gmail.com');
            return;
        }
        
        // Send email using EmailJS
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams);
        
        // Show success message
        showSuccessMessage();
        
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit My Birthday Plans! 💝';
        
    } catch (error) {
        console.error('Error sending email:', error);
        alert('Oops! There was an error sending your itinerary. Please try again or contact support.');
        
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit My Birthday Plans! 💝';
    }
});

function formatItineraryForEmail() {
    let formatted = '🎉 BIRTHDAY WEEKEND ITINERARY 🎉\n\n';
    
    formatted += '═══════════════════════════════\n';
    formatted += '📅 December 4, 2025 (Thursday)\n';
    formatted += '═══════════════════════════════\n';
    if (scheduleData.dec4.length > 0) {
        scheduleData.dec4.forEach((activity, index) => {
            formatted += `${index + 1}. ${activity}\n`;
        });
    } else {
        formatted += 'No activities planned\n';
    }
    formatted += '\n';
    
    formatted += '═══════════════════════════════\n';
    formatted += '📅 December 5, 2025 (Friday)\n';
    formatted += '═══════════════════════════════\n';
    if (scheduleData.dec5.length > 0) {
        scheduleData.dec5.forEach((activity, index) => {
            formatted += `${index + 1}. ${activity}\n`;
        });
    } else {
        formatted += 'No activities planned\n';
    }
    formatted += '\n';
    
    formatted += '═══════════════════════════════\n';
    formatted += '📅 December 6, 2025 (Saturday)\n';
    formatted += '═══════════════════════════════\n';
    if (scheduleData.dec6.length > 0) {
        scheduleData.dec6.forEach((activity, index) => {
            formatted += `${index + 1}. ${activity}\n`;
        });
    } else {
        formatted += 'No activities planned\n';
    }
    formatted += '\n';
    
    return formatted;
}

function showSuccessMessage() {
    const overlay = document.getElementById('overlay');
    const successMessage = document.getElementById('success-message');
    
    overlay.classList.remove('hidden');
    successMessage.classList.remove('hidden');
    
    // Create confetti effect
    createConfetti();
}

function createConfetti() {
    const colors = ['#FFB6C1', '#E6E6FA', '#FFD700', '#FFC0CB', '#DDA0DD'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 50);
    }
}

// Close success message
document.getElementById('close-success').addEventListener('click', () => {
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('success-message').classList.add('hidden');
});