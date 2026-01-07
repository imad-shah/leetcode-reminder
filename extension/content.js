let has_handled_submission = false;
let current_problem = null;

const target_sentence = 'You have successfully completed this problem!';

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 10000;
        padding: 16px 24px; border-radius: 8px; font-family: system-ui, sans-serif;
        font-size: 14px; color: white; max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
        background-color: ${type === "success" ? "#48c78e" : "#f14668"};
    `;
    toast.textContent = message;

    const style = document.createElement("style");
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease-in forwards";
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

function if_sentence_exists() {
    const all_paragraphs = document.querySelectorAll('p');
    return Array.from(all_paragraphs).some(paragraph => paragraph.textContent.trim() === target_sentence);
}
function show_difficulty_modal() {
    const overlay = document.createElement("div");
    overlay.id = "difficulty-overlay";
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.7); z-index: 9998;
    `;
    const modal = document.createElement("div");
    modal.id = "difficulty-modal";
    modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background-color: #1a1a1a; padding: 24px; border-radius: 8px;
        z-index: 9999; color: white; font-family: system-ui, sans-serif;
        width: 400px; text-align: center;
    `;
    const title = document.createElement("h2");
    title.textContent = "How difficult was this problem?";
    title.style.cssText = `margin-bottom: 20px; font-size: 18px;`;
    const sliderContainer = document.createElement("div");
    sliderContainer.style.cssText = `position: relative; width: 100%; padding: 10px 0 30px 0;`;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "1";
    slider.max = "5";
    slider.value = "3";
    slider.step = "1";
    slider.style.cssText = `
        width: 100%; margin: 10px 0; cursor: pointer;
        -webkit-appearance: none; appearance: none;
        background: linear-gradient(to right, #48c78e 0%, #48c78e 50%, #444 50%, #444 100%);
        height: 6px; border-radius: 3px;
    `;

    const ticksContainer = document.createElement("div");
    ticksContainer.style.cssText = `
        display: flex; justify-content: space-between;
        position: absolute; width: 100%; bottom: 5px;
        padding: 0 2px; box-sizing: border-box;
    `;

    for (let i = 1; i <= 5; i++) {
        const tick = document.createElement("div");
        tick.style.cssText = `
            display: flex; flex-direction: column; align-items: center;
            cursor: pointer; user-select: none;
        `;
        const tickMark = document.createElement("div");
        tickMark.style.cssText = `
            width: 2px; height: 8px; background: #666; margin-bottom: 4px;
        `;
        const tickLabel = document.createElement("span");
        tickLabel.textContent = i;
        tickLabel.style.cssText = `font-size: 12px; color: #888;`;
        tick.appendChild(tickMark);
        tick.appendChild(tickLabel);
        tick.addEventListener("click", () => {
            slider.value = i;
            slider.dispatchEvent(new Event("input"));
        });
        ticksContainer.appendChild(tick);
    }

    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(ticksContainer);

    const descriptions = {
        1: "Trivial: Easily recognized pattern, solution came effortless",
        2: "Easy: Recognized the approach, minor implementation effort/syntax errors",
        3: "Medium: Needed some thought, but solved within reasonable time",
        4: "Hard: Struggled significantly, either barely solved it or needed to look at solution",
        5: "No clue: No chance of solving within 30 minutes",
    };

    const difficultyDisplay = document.createElement("div");
    difficultyDisplay.style.cssText = `font-size: 24px; font-weight: bold; color: #48c78e; margin: 5px 0;`;
    difficultyDisplay.textContent = "3 / 5";

    const description = document.createElement("p");
    description.textContent = descriptions[3];
    description.style.cssText = `font-size: 14px; color: #aaa; margin: 10px 0; min-height: 42px;`;

    const updateSlider = () => {
        const val = slider.value;
        const percent = ((val - 1) / 4) * 100;
        slider.style.background = `linear-gradient(to right, #48c78e 0%, #48c78e ${percent}%, #444 ${percent}%, #444 100%)`;
        difficultyDisplay.textContent = `${val} / 5`;
        description.textContent = descriptions[val];
    };

    slider.addEventListener("input", updateSlider);
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `display: flex; gap: 10px; justify-content: center; margin-top: 20px;`;
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `
        padding: 8px 20px; border: 1px solid #444; background: transparent;
        color: white; border-radius: 4px; cursor: pointer;
    `;
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.style.cssText = `
        padding: 8px 20px; border: none; background: #48c78e;
        color: white; border-radius: 4px; cursor: pointer;
    `;
    cancelBtn.addEventListener("click", () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
    });

    submitBtn.addEventListener("click", () => {
        const difficulty = parseInt(slider.value);
        const url = 'http://127.0.0.1:8000/submit';
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
        submitBtn.style.opacity = "0.7";
        cancelBtn.disabled = true;

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ problem: current_problem, difficulty: difficulty })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                document.body.removeChild(overlay);
                document.body.removeChild(modal);
                has_handled_submission = true;
                showToast(data, "success");
                console.log("Successfully submitted:", current_problem, "Difficulty:", difficulty);
            })
            .catch(error => {
                document.body.removeChild(overlay);
                document.body.removeChild(modal);
                has_handled_submission = true;
                const errorMessage = error.message.includes("Failed to fetch")
                    ? "Failed to submit - is the server running?"
                    : `Failed to submit: ${error.message}`;
                showToast(errorMessage, "error");
                console.error("Submission failed:", error);
            });
    });

    overlay.addEventListener("click", () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
    });
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(submitBtn);
    modal.appendChild(title);
    modal.appendChild(sliderContainer);
    modal.appendChild(difficultyDisplay);
    modal.appendChild(description);
    modal.appendChild(buttonContainer);
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
}
function handleMutation(mutations) {
    let new_problem = document.querySelector("app-prompt .question-tab .flex-container-row > h1")?.textContent.trim();
    if (new_problem && new_problem != current_problem) {
        has_handled_submission = false;
        current_problem = new_problem;
    }
    if (!has_handled_submission) {
        if (if_sentence_exists()) {
            has_handled_submission = true;
            show_difficulty_modal();
        }
    }
}

const observer = new MutationObserver(handleMutation);

observer.observe(document.body, {
    childList: true,
    subtree: true
})