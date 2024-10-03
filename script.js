let timerInterval; // Declare timerInterval in the outer scope
let currentQuestion = 1; // Track the current question being answered

document.getElementById('omr-setup-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form values
    const numQuestions = document.getElementById('num-questions').value;
    const examDuration = document.getElementById('exam-duration').value;

    // Hide setup and show OMR sheet
    document.querySelector('.setup-container').style.display = 'none';
    document.querySelector('.omr-container').style.display = 'block';

    // Populate OMR table with dynamic number of questions
    const omrBody = document.getElementById('omr-body');
    omrBody.innerHTML = ''; // Clear any previous content

    for (let i = 1; i <= numQuestions; i++) {
        omrBody.innerHTML += `
            <tr id="row-q${i}">
                <td class="q-num">${i}</td>
                <td>
                    <div class="radio-group">
                        <input type="radio" id="q${i}-a" name="q${i}" value="A">
                        <label for="q${i}-a">A</label>
                        <input type="radio" id="q${i}-b" name="q${i}" value="B">
                        <label for="q${i}-b">B</label>
                        <input type="radio" id="q${i}-c" name="q${i}" value="C">
                        <label for="q${i}-c">C</label>
                        <input type="radio" id="q${i}-d" name="q${i}" value="D">
                        <label for="q${i}-d">D</label>
                    </div>
                </td>
            </tr>
        `;
    }

    // Start the timer with the exam duration
    startTimer(examDuration);

    // Add hover event to focus question when mouse hovers
    document.querySelectorAll('tr').forEach((row, index) => {
        row.addEventListener('mouseover', () => {
            focusQuestion(index); // Hovering highlights and focuses the question
        });
    });

    // Focus the first question when OMR loads
    focusQuestion(1); // Focus and highlight the first question
});

// Function to handle the countdown timer
function startTimer(duration) {
    const timerDisplay = document.getElementById('time-left');
    let time = duration * 60; // Convert minutes to seconds

    timerInterval = setInterval(function() {
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;

        // Display the remaining time
        timerDisplay.textContent = `Time Remaining: ${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

        // Decrement the time
        time--;

        // When the time reaches 0, stop the timer
        if (time < 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = "Time's up!";
            document.querySelectorAll('input[type="radio"]').forEach(input => input.disabled = true);
        }
    }, 1000);
}

// Add event listeners to all radio buttons
document.addEventListener('change', function(e) {
    if (e.target.type === 'radio') {
        const questionRow = e.target.closest('tr'); // Get the parent row of the clicked radio button
        
        // Disable all radio buttons for this question
        const radios = questionRow.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.disabled = true; // Disable each radio button for this question
        });

        // Apply background color to the row to indicate the answer is locked
        questionRow.style.color = 'orange'; // Change to lowercase 'c'
    }
});

// Function to move focus to a specific question and highlight it
function focusQuestion(questionNumber) {
    const totalQuestions = document.getElementById('num-questions').value;

    // Ensure we don't go out of bounds
    if (questionNumber < 1 || questionNumber > totalQuestions) return;

    currentQuestion = questionNumber;

    // Scroll to and highlight the current question
    document.querySelectorAll('tr').forEach((row) => {
        row.style.backgroundColor = ''; // Reset background for all rows
    });
    const currentRow = document.getElementById(`row-q${currentQuestion}`);
    // currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    currentRow.style.backgroundColor = '#f0f8ff'; // Highlight the current row
}

// Handle keydown events to select answers, lock answers, and navigate between questions
document.addEventListener('keydown', function(e) {
    const key = e.key;
    const currentRadios = document.querySelectorAll(`input[name="q${currentQuestion}"]`);
    const currentRow = document.getElementById(`row-q${currentQuestion}`);

    if (['1', '2', '3', '4'].includes(key)) {
        // Map keys 1-4 to radio buttons A-D
        const index = parseInt(key) - 1; // Convert key '1', '2', etc. to index
        if (currentRadios[index] && !currentRadios[index].disabled) {
            currentRadios[index].checked = true;

            // Simulate a change event to trigger any necessary logic
            currentRadios[index].dispatchEvent(new Event('change'));
        }
    } else if (key === 'Enter') {
        // Lock the selected answer for the current question
        const selectedRadio = document.querySelector(`input[name="q${currentQuestion}"]:checked`);

        if (selectedRadio && !selectedRadio.disabled) {
            // Disable the selected radio button and lock the current question
            const radios = currentRow.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                radio.disabled = true; // Disable all radio buttons for this question
            });

            // Apply background color to indicate answer is locked
            currentRow.style.color = 'orange'; // Indicate locked state

            // Move to the next question automatically
            focusQuestion(currentQuestion + 1);
        }
    } else if (key === 'ArrowUp') {
        // Move to the previous question
        focusQuestion(currentQuestion - 1);
    } else if ((key === 'ArrowDown') || (key === '0')) {
        // Move to the next question
        focusQuestion(currentQuestion + 1);
    }
    // Hide cursor on key press when on OMR sheet
    const omrContainer = document.querySelector('.omr-container');
    omrContainer.style.cursor = 'none'; // Hide the cursor
});

// Show cursor when mouse is moved in the OMR container
document.querySelector('.omr-container').addEventListener('mousemove', function() {
    this.style.cursor = 'default'; // Show the cursor
});

// Function to reset the OMR sheet (reset radio selections and restart the timer)
function reset() {
    // Clear radio selections
    document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
        input.checked = false; // Uncheck each radio button
    });

    // Enable all radio buttons for answering again
    document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.disabled = false; // Enable each radio button
    });

    // Reset the background color of all question rows
    const questionRows = document.querySelectorAll('.omr-container tbody tr');
    questionRows.forEach(row => {
        row.style.color = ''; // Reset color to default
    });

    // Restart the timer (assuming you want to retain the original duration)
    const examDuration = document.getElementById('exam-duration').value;
    clearInterval(timerInterval); // Stop any existing timer
    startTimer(examDuration); // Start a new timer
    focusQuestion(1); // Reset to the first question
}

// Function to save answers when the user clicks 'Save'
function submitAnswers() {
    clearInterval(timerInterval); // Stop the timer
    const numQuestions = document.getElementById('num-questions').value;
    let answers = [];

    for (let i = 1; i <= numQuestions; i++) {
        const selectedAnswer = document.querySelector(`input[name="q${i}"]:checked`);
        if (selectedAnswer) {
            answers.push({ question: i, answer: selectedAnswer.value });
        } else {
            answers.push({ question: i, answer: null }); // If no answer is selected
        }
    }

    // console.log("Submitted Answers:", answers);

    // Display the answers in a simple alert box
    let answerSummary = answers.map(a => `Q${a.question}: ${a.answer || 'No Answer'}`).join('\n');
    // alert('Submitted Answers:\n' + answerSummary);
    
    // Optionally, disable the inputs after submission
    document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.disabled = true; // Lock the answers after submission
    });
}
