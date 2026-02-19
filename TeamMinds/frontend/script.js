const API_BASE = "http://localhost:8000/api";

// Elements
const codeEditor = document.getElementById('code-editor');
const reviewBtn = document.getElementById('review-btn');
const executeBtn = document.getElementById('execute-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const resultsContainer = document.getElementById('results-container');
const initialState = document.getElementById('initial-state');

// Tab Contents
const reviewContent = document.getElementById('review-content');
const rewriteContent = document.getElementById('rewrite-content');
const testsContent = document.getElementById('tests-content');
const consoleContent = document.getElementById('console-content');

// Tab Buttons
const tabBtns = document.querySelectorAll('.tab-btn');

// State
let currentCode = "";
let currentLanguage = "python";

// Setup
document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active
            tabBtns.forEach(b => b.classList.remove('active', 'border-indigo-500', 'text-white'));
            tabBtns.forEach(b => b.classList.add('border-transparent', 'text-gray-500'));

            // Add active
            btn.classList.add('active', 'border-indigo-500', 'text-white');
            btn.classList.remove('border-transparent', 'text-gray-500');

            // Hide all content
            [reviewContent, rewriteContent, testsContent, consoleContent].forEach(el => el.classList.add('hidden'));

            // Show target
            document.getElementById(`${btn.dataset.tab}-content`).classList.remove('hidden');
        });
    });

    // Language Select
    document.getElementById('language-select').addEventListener('change', (e) => {
        currentLanguage = e.target.value;
    });

    // Review Button
    reviewBtn.addEventListener('click', async () => {
        currentCode = codeEditor.value;
        if (!currentCode.trim()) return alert("Please enter some code first.");

        showLoading(true);
        try {
            await Promise.all([
                fetchReview(currentCode),
                fetchRewrite(currentCode),
                fetchTests(currentCode)
            ]);
            initialState.classList.add('hidden');
            document.querySelector('[data-tab="review"]').click(); // content unhidden by click handler
        } catch (error) {
            console.error(error);
            alert("Error analyzing code. Please check console (and ensure backend is running).");
        } finally {
            showLoading(false);
        }
    });

    // Execute Button
    executeBtn.addEventListener('click', async () => {
        currentCode = codeEditor.value;
        if (!currentCode.trim()) return;

        document.querySelector('[data-tab="console"]').click();
        const outputDiv = document.getElementById('console-output');
        outputDiv.innerHTML += `\n> Running code...\n`;

        try {
            const res = await fetch(`${API_BASE}/execute/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: currentCode, language: currentLanguage })
            });
            const data = await res.json();

            if (data.output) {
                outputDiv.innerHTML += `<span class="console-success">${data.output}</span>`;
            }
            if (data.error) {
                outputDiv.innerHTML += `<span class="console-error">${data.error}</span>`;
            }
            outputDiv.innerHTML += `\n[Exited with status: ${data.status}]\n`;

        } catch (error) {
            outputDiv.innerHTML += `<span class="console-error">Execution API failed to connect.</span>`;
        }
    });

    // Run Generated Tests
    document.getElementById('run-tests-btn').addEventListener('click', async () => {
        const testCode = document.getElementById('test-code').textContent;
        if (!testCode) return;

        document.querySelector('[data-tab="console"]').click();
        const outputDiv = document.getElementById('console-output');
        outputDiv.innerHTML += `\n> Running generated tests...\n`;

        try {
            const res = await fetch(`${API_BASE}/execute/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: testCode, language: currentLanguage })
            });
            const data = await res.json();

            if (data.output) outputDiv.innerHTML += `<span class="console-success">${data.output}</span>`;
            if (data.error) outputDiv.innerHTML += `<span class="console-error">${data.error}</span>`;

        } catch (error) {
            outputDiv.innerHTML += `<span class="console-error">Test execution failed.</span>`;
        }
    });

});

function showLoading(show) {
    if (show) loadingOverlay.classList.remove('hidden');
    else loadingOverlay.classList.add('hidden');
}

async function fetchReview(code) {
    const res = await fetch(`${API_BASE}/review/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: currentLanguage, focus_areas: ["bugs", "security", "performance"] })
    });
    if (!res.ok) throw new Error("Review failed");
    const data = await res.json();

    // Render Summary
    document.getElementById('review-summary').textContent = data.improvement_summary;
    document.getElementById('confidence-text').textContent = `${(data.confidence_score * 100).toFixed(0)}%`;
    document.getElementById('confidence-bar').style.width = `${data.confidence_score * 100}%`;

    // Render Issues
    const issuesList = document.getElementById('issues-list');
    issuesList.innerHTML = '';

    // Helper
    const addIssue = (issue, type, color) => {
        const div = document.createElement('div');
        div.className = `p-4 rounded bg-gray-800 border-l-4 border-${color}-500 issue-card flex items-start space-x-3`;
        div.innerHTML = `
            <i class="fas fa-exclamation-circle text-${color}-500 mt-1"></i>
            <div>
                <h4 class="text-sm font-bold text-gray-300 uppercase tracking-wider">${type}</h4>
                <p class="text-gray-400 text-sm mt-1">${issue}</p>
            </div>
        `;
        issuesList.appendChild(div);
    };

    data.critical_issues.forEach(i => addIssue(i, 'Critical', 'red'));
    data.high_issues.forEach(i => addIssue(i, 'High', 'orange'));
    data.medium_issues.forEach(i => addIssue(i, 'Medium', 'yellow'));
    data.low_issues.forEach(i => addIssue(i, 'Low', 'blue'));

    if (issuesList.children.length === 0) {
        issuesList.innerHTML = `<div class="text-center text-green-500 py-4"><i class="fas fa-check-circle text-2xl mb-2"></i><p>No major issues found!</p></div>`;
    }
}

async function fetchRewrite(code) {
    const res = await fetch(`${API_BASE}/rewrite/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: currentLanguage })
    });
    if (!res.ok) throw new Error("Rewrite failed");
    const data = await res.json();

    document.getElementById('rewritten-code').textContent = data.rewritten_code;
    document.getElementById('perf-improvement').textContent = `⚡ Analysis: ${data.performance_improvement || "Optimized"}`;
    hljs.highlightElement(document.getElementById('rewritten-code'));
}

async function fetchTests(code) {
    const res = await fetch(`${API_BASE}/test/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: currentLanguage })
    });
    if (!res.ok) throw new Error("Test gen failed");
    const data = await res.json();

    document.getElementById('test-code').textContent = data.test_code;
    hljs.highlightElement(document.getElementById('test-code'));
}
