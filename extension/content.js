let has_handled_submission = false;
let current_problem = null;

const target_sentence = 'You have successfully completed this problem!';

function if_sentence_exists() {
    const all_paragraphs = document.querySelectorAll('p');
    return Array.from(all_paragraphs).some(paragraph => paragraph.textContent.trim() === target_sentence);
}

function handleMutation(mutations) {
   let new_problem = document.querySelector("app-prompt .question-tab .flex-container-row > h1")?.textContent.trim();
   if (new_problem && new_problem != current_problem) {
        has_handled_submission = false;
        current_problem = new_problem;
   }
   if (!has_handled_submission) {
    if (if_sentence_exists()) {
        let user_difficulty;
        while (true) {
            let raw_input = prompt("Enter a value (1-5) representing how difficult that problem was where 1 = Trivia and 5 = No clue: ") 

            if (raw_input === null || raw_input.trim() === "") {
                user_difficulty = 3;
                alert("Using default difficulty: 3");
                break;
            } 

            let num = Number(raw_input);

            if (!isNaN(num) && Number.isInteger(num) && num >= 1 && num <= 5) {
                user_difficulty = num;
                break;
            }
            alert("Invalid input. Please enter a whole number between 1 and 5")
        }
        has_handled_submission = true;
        console.log("Success detected for:", current_problem, "Difficulty:", user_difficulty);
    }
   }
    
}

const observer = new MutationObserver(handleMutation);

observer.observe(document.body, {
    childList: true,
    subtree: true
})