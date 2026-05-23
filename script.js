const PadelMexicano = {
    // Application State
    players: [],

    // Initialize the application and attach event handlers
    init() {
        // Load existing data from storage
        this.players = JSON.parse(localStorage.getItem('padel_players')) || [];
        this.updateUI();

        // 1. Static Event Handlers
        document.getElementById('btnAddPlayer')
            .addEventListener('click', () => this.addPlayer());

        document.getElementById('btnGenerateRound')
            .addEventListener('click', () => this.generateNextRound());

        document.getElementById('btnResetTournament')
            .addEventListener('click', () => this.clearTournament());

        // Allow pressing "Enter" key in the player input box
        document.getElementById('playerName')
            .addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addPlayer();
            });

        // 2. Dynamic Event Delegation for Court Submission Buttons
        // Because court HTML is generated on the fly, we monitor the stable parent element.
        document.getElementById('matchesContainer')
            .addEventListener('click', (event) => {
                if (event.target && event.target.classList.contains('btn-submit-score')) {
                    this.handleScoreSubmission(event.target);
                }
            });
    },

    saveData() {
        localStorage.setItem('padel_players', JSON.stringify(this.players));
    },

    addPlayer() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();
        if (name) {
            this.players.push({ name: name, points: 0 });
            nameInput.value = '';
            this.saveData();
            this.updateUI();
        }
    },

    updateUI() {
        const list = document.getElementById('playerList');
        list.innerHTML = this.players.map(p => `<li>${p.name} <span>${p.points} pts</span></li>`).join('');
        
        const leaderboard = document.getElementById('leaderboard');
        const sorted = [...this.players].sort((a, b) => b.points - a.points);
        leaderboard.innerHTML = sorted.map((p, index) => `<li>#${index + 1} ${p.name} <span>${p.points} pts</span></li>`).join('');
    },

    generateNextRound() {
        if (this.players.length < 4) {
            alert("You need at least 4 players!");
            return;
        }
        
        this.players.sort((a, b) => b.points - a.points);
        
        let container = document.getElementById('matchesContainer');
        container.innerHTML = '';

        const totalCourts = Math.floor(this.players.length / 4);

        for (let i = 0; i < totalCourts; i++) {
            let idx = i * 4;
            let p1 = this.players[idx], 
                p2 = this.players[idx+3], 
                p3 = this.players[idx+1], 
                p4 = this.players[idx+2];
            
            if(!p1 || !p2 || !p3 || !p4) break;

            // Notice data attributes (data-p1, data-court, etc.) hold configuration context
            container.innerHTML += `
                <div class="court-container">
                    <h4>Court ${i+1}</h4>
                    <p>${p1.name} & ${p2.name} <strong>VS</strong> ${p3.name} & ${p4.name}</p>
                    <input type="number" id="scoreA_${i}" class="score-input" placeholder="Team 1 Score">
                    <input type="number" id="scoreB_${i}" class="score-input" placeholder="Team 2 Score">
                    <button class="btn-submit-score" 
                            data-court="${i}" 
                            data-p1="${idx}" data-p2="${idx+3}" 
                            data-p3="${idx+1}" data-p4="${idx+2}">
                        Submit Score
                    </button>
                </div>
            `;
        }
    },

    // Processes clicks caught by Event Delegation on the container
    handleScoreSubmission(buttonElement) {
        // Extract player indices and court ID from data-attributes
        const courtNum = buttonElement.getAttribute('data-court');
        const p1Idx = parseInt(buttonElement.getAttribute('data-p1'));
        const p2Idx = parseInt(buttonElement.getAttribute('data-p2'));
        const p3Idx = parseInt(buttonElement.getAttribute('data-p3'));
        const p4Idx = parseInt(buttonElement.getAttribute('data-p4'));

        const scoreAInput = document.getElementById(`scoreA_${courtNum}`);
        const scoreBInput = document.getElementById(`scoreB_${courtNum}`);
        const scoreA = parseInt(scoreAInput.value);
        const scoreB = parseInt(scoreBInput.value);

        if (isNaN(scoreA) || isNaN(scoreB)) {
            alert(`Please enter scores for Court ${parseInt(courtNum) + 1} first!`);
            return;
        }

        // Tally points
        this.players[p1Idx].points += scoreA;
        this.players[p2Idx].points += scoreA;
        this.players[p3Idx].points += scoreB;
        this.players[p4Idx].points += scoreB;

        this.saveData();
        this.updateUI();
        
        // Disable UI controls for this court
        scoreAInput.disabled = true;
        scoreBInput.disabled = true;
        buttonElement.disabled = true;
        buttonElement.innerText = "Saved ✓";
    },

    clearTournament() {
        if (confirm("Are you sure you want to clear all players and scores? This cannot be undone.")) {
            this.players = [];
            localStorage.removeItem('padel_players');
            this.updateUI();
            document.getElementById('matchesContainer').innerHTML = 'No matches generated yet.';
            alert("Tournament reset!");
        }
    }
};

// Fire initialization hook when DOM resources finish parsing
window.addEventListener('DOMContentLoaded', () => PadelMexicano.init());
