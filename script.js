const PadelMexicano = {
    players: [],
    currentRound: 0,

    init() {
        this.players = (JSON.parse(localStorage.getItem('padel_players')) || []).map(p => ({
            name: p.name,
            points: p.points || 0,
            byes: p.byes || 0
        }));
        this.currentRound = parseInt(localStorage.getItem('padel_round'), 10) || 0;
        this.updateUI();

        document.getElementById('btnAddPlayer')
            .addEventListener('click', () => this.addPlayer());

        document.getElementById('btnGenerateRound')
            .addEventListener('click', () => this.generateNextRound());

        document.getElementById('btnResetTournament')
            .addEventListener('click', () => this.clearTournament());

        document.getElementById('playerName')
            .addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addPlayer();
            });

        document.getElementById('playerList')
            .addEventListener('click', (event) => {
                if (event.target.classList.contains('btn-remove-player')) {
                    this.removePlayer(event.target.getAttribute('data-name'));
                }
            });

        document.getElementById('matchesContainer')
            .addEventListener('click', (event) => {
                if (event.target.classList.contains('btn-submit-score')) {
                    this.handleScoreSubmission(event.target);
                }
            });
    },

    saveData() {
        localStorage.setItem('padel_players', JSON.stringify(this.players));
        localStorage.setItem('padel_round', String(this.currentRound));
    },

    addPlayer() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();
        if (!name) return;

        if (this.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert(`"${name}" is already in the tournament.`);
            return;
        }

        this.players.push({ name, points: 0, byes: 0 });
        nameInput.value = '';
        this.saveData();
        this.updateUI();
    },

    removePlayer(name) {
        if (!confirm(`Remove ${name} from the tournament?`)) return;

        this.players = this.players.filter(p => p.name !== name);
        this.saveData();
        this.updateUI();
    },

    updateUI() {
        const list = document.getElementById('playerList');
        if (this.players.length === 0) {
            list.innerHTML = '<li class="empty-state">No players yet</li>';
        } else {
            list.innerHTML = this.players.map(p => `
                <li>
                    <span>${p.name}</span>
                    <span class="player-meta">
                        <span>${p.points} pts</span>
                        <button class="btn-remove-player" data-name="${p.name}" title="Remove player">×</button>
                    </span>
                </li>
            `).join('');
        }

        const leaderboard = document.getElementById('leaderboard');
        if (this.players.length === 0) {
            leaderboard.innerHTML = '<li class="empty-state">Add players to see standings</li>';
        } else {
            const sorted = [...this.players].sort((a, b) => b.points - a.points || a.byes - b.byes);
            leaderboard.innerHTML = sorted.map((p, index) => `
                <li class="${index === 0 ? 'leader-first' : ''}">
                    <span>#${index + 1} ${p.name}</span>
                    <span>${p.points} pts</span>
                </li>
            `).join('');
        }

        document.getElementById('roundLabel').textContent =
            this.currentRound > 0 ? `Round ${this.currentRound}` : 'No round yet';
    },

    generateNextRound() {
        if (this.players.length < 4) {
            alert('You need at least 4 players!');
            return;
        }

        this.currentRound += 1;

        const container = document.getElementById('matchesContainer');
        container.innerHTML = '';

        let roundPlayers = [...this.players];
        const byeCount = roundPlayers.length % 4;

        if (byeCount > 0) {
            roundPlayers.sort((a, b) => a.byes - b.byes || a.points - b.points);

            const restingPlayers = roundPlayers.splice(0, byeCount);
            restingPlayers.forEach(player => {
                const mainPlayerIndex = this.players.findIndex(p => p.name === player.name);
                this.players[mainPlayerIndex].byes += 1;
            });

            const names = restingPlayers.map(p => p.name).join(', ');
            container.innerHTML += `
                <div class="bye-notice">
                    <strong>☕ Resting this round:</strong> ${names}
                </div>
            `;
        }

        roundPlayers.sort((a, b) => b.points - a.points);

        const totalCourts = Math.floor(roundPlayers.length / 4);

        for (let i = 0; i < totalCourts; i++) {
            const idx = i * 4;
            const p1 = roundPlayers[idx];
            const p2 = roundPlayers[idx + 3];
            const p3 = roundPlayers[idx + 1];
            const p4 = roundPlayers[idx + 2];

            if (!p1 || !p2 || !p3 || !p4) break;

            const m1 = this.players.findIndex(p => p.name === p1.name);
            const m2 = this.players.findIndex(p => p.name === p2.name);
            const m3 = this.players.findIndex(p => p.name === p3.name);
            const m4 = this.players.findIndex(p => p.name === p4.name);

            container.innerHTML += `
                <div class="court-container">
                    <h4>Court ${i + 1}</h4>
                    <p>${p1.name} & ${p2.name} <strong>VS</strong> ${p3.name} & ${p4.name}</p>
                    <input type="number" id="scoreA_${i}" class="score-input" placeholder="Team 1 Score" min="0">
                    <input type="number" id="scoreB_${i}" class="score-input" placeholder="Team 2 Score" min="0">
                    <button class="btn-submit-score"
                            data-court="${i}"
                            data-p1="${m1}" data-p2="${m2}"
                            data-p3="${m3}" data-p4="${m4}">
                        Submit Score
                    </button>
                </div>
            `;
        }

        this.saveData();
        this.updateUI();
    },

    handleScoreSubmission(buttonElement) {
        const courtNum = buttonElement.getAttribute('data-court');
        const p1Idx = parseInt(buttonElement.getAttribute('data-p1'), 10);
        const p2Idx = parseInt(buttonElement.getAttribute('data-p2'), 10);
        const p3Idx = parseInt(buttonElement.getAttribute('data-p3'), 10);
        const p4Idx = parseInt(buttonElement.getAttribute('data-p4'), 10);

        const scoreAInput = document.getElementById(`scoreA_${courtNum}`);
        const scoreBInput = document.getElementById(`scoreB_${courtNum}`);
        const scoreA = parseInt(scoreAInput.value, 10);
        const scoreB = parseInt(scoreBInput.value, 10);

        if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
            alert(`Please enter valid scores for Court ${parseInt(courtNum, 10) + 1}.`);
            return;
        }

        this.players[p1Idx].points += scoreA;
        this.players[p2Idx].points += scoreA;
        this.players[p3Idx].points += scoreB;
        this.players[p4Idx].points += scoreB;

        this.saveData();
        this.updateUI();

        scoreAInput.disabled = true;
        scoreBInput.disabled = true;
        buttonElement.disabled = true;
        buttonElement.innerText = 'Saved ✓';
    },

    clearTournament() {
        if (!confirm('Are you sure you want to clear all players and scores? This cannot be undone.')) {
            return;
        }

        this.players = [];
        this.currentRound = 0;
        localStorage.removeItem('padel_players');
        localStorage.removeItem('padel_round');
        this.updateUI();
        document.getElementById('matchesContainer').innerHTML = 'No matches generated yet.';
    }
};

window.addEventListener('DOMContentLoaded', () => PadelMexicano.init());
