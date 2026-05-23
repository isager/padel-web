const PadelMexicano = {
    // Application State
    players: [],

    // Initialize the application
    init() {
        this.players = JSON.parse(localStorage.getItem('padel_players')) || [];
        this.updateUI();
    },

    // Save state to browser storage
    saveData() {
        localStorage.setItem('padel_players', JSON.stringify(this.players));
    },

    // Add a new player to the roster
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

    // Handle updating all presentation segments
    updateUI() {
        // Update Roster List
        const list = document.getElementById('playerList');
        list.innerHTML = this.players.map(p => `<li>${p.name} <span>${p.points} pts</span></li>`).join('');
        
        // Update Leaderboard Rank
        const leaderboard = document.getElementById('leaderboard');
        const sorted = [...this.players].sort((a, b) => b.points - a.points);
        leaderboard.innerHTML = sorted.map((p, index) => `<li>#${index + 1} ${p.name} <span>${p.points} pts</span></li>`).join('');
    },

    // Calculate pairings and construct multi-court layouts
    generateNextRound() {
        if (this.players.length < 4) {
            alert("You need at least 4 players!");
            return;
        }
        
        // Mexicano Pairing: Sort players by points standing
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

            container.innerHTML += `
                <div class="court-container">
                    <h4>Court ${i+1}</h4>
                    <p>${p1.name} & ${p2.name} <strong>VS</strong> ${p3.name} & ${p4.name}</p>
                    <input type="number" id="scoreA_${i}" class="score-input" placeholder="Team 1 Score">
                    <input type="number" id="scoreB_${i}" class="score-input" placeholder="Team 2 Score">
                    <button onclick="PadelMexicano.submitScore(${idx}, ${idx+3}, ${idx+1}, ${idx+2}, ${i})">Submit Score</button>
                </div>
            `;
        }
    },

    // Submit individual court totals and commit to memory
    submitScore(p1Idx, p2Idx, p3Idx, p4Idx, courtNum) {
        const scoreA = parseInt(document.getElementById(`scoreA_${courtNum}`).value);
        const scoreB = parseInt(document.getElementById(`scoreB_${courtNum}`).value);

        if (isNaN(scoreA) || isNaN(scoreB)) {
            alert(`Please enter scores for Court ${courtNum + 1} first!`);
            return;
        }

        // Tally points
        this.players[p1Idx].points += scoreA;
        this.players[p2Idx].points += scoreA;
        this.players[p3Idx].points += scoreB;
        this.players[p4Idx].points += scoreB;

        this.saveData();
        this.updateUI();
        
        // Locking inputs to indicate match completion on court
        document.getElementById(`scoreA_${courtNum}`).disabled = true;
        document.getElementById(`scoreB_${courtNum}`).disabled = true;
        
        const btn = document.getElementById(`scoreA_${courtNum}`).parentElement.querySelector('button');
        btn.disabled = true;
        btn.innerText = "Saved ✓";
    },

    // Wipe storage bucket and memory configuration
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
