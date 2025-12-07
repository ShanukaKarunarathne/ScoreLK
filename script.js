// Cricket Score Tracker Logic
class CricketScorer {
    constructor() {
        this.teamA = {
            name: localStorage.getItem('teamAName') || 'Team A',
            runs: 0,
            wickets: 0,
            balls: 0,
            overs: 0,
            players: parseInt(localStorage.getItem('teamAPlayers')) || 11
        };
        
        this.teamB = {
            name: localStorage.getItem('teamBName') || 'Team B',
            runs: 0,
            wickets: 0,
            balls: 0,
            overs: 0,
            players: parseInt(localStorage.getItem('teamBPlayers')) || 11
        };
        
        this.totalOvers = parseInt(localStorage.getItem('totalOvers')) || 20;
        this.battingTeam = localStorage.getItem('battingFirst') || 'A';
        this.currentOver = [];
        this.history = [];
        this.extraPending = null; // Track if Wide or No Ball was clicked
        this.firstInningsComplete = false;
        this.matchOver = false;
        this.oversHistory = []; // Store completed overs
        
        this.init();
    }
    
    init() {
        // Update team names from localStorage
        document.getElementById('teamAName').textContent = this.teamA.name;
        document.getElementById('teamBName').textContent = this.teamB.name;
        document.getElementById('matchOvers').textContent = this.totalOvers;
        document.getElementById('teamANameSettings').textContent = this.teamA.name;
        document.getElementById('teamBNameSettings').textContent = this.teamB.name;
        document.getElementById('teamAPlayerCount').textContent = this.teamA.players;
        document.getElementById('teamBPlayerCount').textContent = this.teamB.players;
        
        // Add event listeners for run buttons
        document.querySelectorAll('.btn-run').forEach(btn => {
            btn.addEventListener('click', () => {
                const runs = parseInt(btn.dataset.runs);
                this.addRuns(runs);
            });
        });
        
        // Add event listeners for extras
        document.querySelectorAll('.btn-extra').forEach(btn => {
            btn.addEventListener('click', () => {
                const extra = btn.dataset.extra;
                this.addExtra(extra);
            });
        });
        
        // Wicket button
        document.querySelector('.btn-wicket').addEventListener('click', () => {
            this.addWicket();
        });
        
        // Switch team button
        document.getElementById('switchTeam').addEventListener('click', () => {
            this.switchInnings();
        });
        
        // Undo button
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the match?')) {
                this.reset();
            }
        });
        
        this.updateDisplay();
    }
    
    getCurrentTeam() {
        return this.battingTeam === 'A' ? this.teamA : this.teamB;
    }
    
    addRuns(runs) {
        if (this.matchOver) {
            alert('Match is already over!');
            return;
        }

        const team = this.getCurrentTeam();
        
        // Save state for undo
        this.saveState();
        
        if (this.extraPending) {
            // Wide or No Ball with runs
            team.runs += runs + 1; // Extra run + batsman runs
            // Don't increment balls for extras
            
            // Add to current over display
            const extraLabel = this.extraPending === 'wide' ? 'WD' : 'NB';
            this.currentOver.push({ type: 'extra', value: `${extraLabel}+${runs}` });
            
            this.extraPending = null; // Reset extra
            this.clearExtraHighlight();
        } else {
            // Normal runs
            team.runs += runs;
            team.balls++;
            
            // Add to current over display
            this.currentOver.push({ type: 'runs', value: runs });
            
            this.checkOverComplete();
        }
        
        this.checkInningsComplete();
        this.updateDisplay();
    }
    
    addExtra(extraType) {
        // Set extra pending and highlight the buttons
        this.extraPending = extraType;
        this.highlightExtraMode();
    }
    
    highlightExtraMode() {
        // Visual feedback that extra is pending
        document.querySelectorAll('.btn-extra').forEach(btn => {
            btn.style.opacity = '0.5';
        });
        document.querySelectorAll('.btn-run').forEach(btn => {
            btn.style.border = '3px solid #FF9800';
        });
        document.getElementById('instructionBanner').style.display = 'block';
    }
    
    clearExtraHighlight() {
        document.querySelectorAll('.btn-extra').forEach(btn => {
            btn.style.opacity = '1';
        });
        document.querySelectorAll('.btn-run').forEach(btn => {
            btn.style.border = 'none';
        });
        document.getElementById('instructionBanner').style.display = 'none';
    }
    
    addWicket() {
        if (this.matchOver) {
            alert('Match is already over!');
            return;
        }

        const team = this.getCurrentTeam();
        
        if (team.wickets >= this.totalPlayers - 1) {
            alert('All out!');
            // Will be handled by checkInningsComplete
        }
        
        // Save state for undo
        this.saveState();
        
        // Clear any pending extra
        if (this.extraPending) {
            this.extraPending = null;
            this.clearExtraHighlight();
        }
        
        team.wickets++;
        team.balls++;
        
        // Add to current over display
        this.currentOver.push({ type: 'wicket', value: 'W' });
        
        this.checkOverComplete();
        this.checkInningsComplete();
        this.updateDisplay();
    }
    
    checkOverComplete() {
        const team = this.getCurrentTeam();
        
        if (team.balls % 6 === 0 && team.balls > 0) {
            // Over complete - save to history
            const overNumber = Math.floor(team.balls / 6);
            const overRuns = this.calculateOverRuns(this.currentOver);
            
            this.oversHistory.push({
                overNumber: overNumber,
                balls: [...this.currentOver],
                runs: overRuns,
                team: this.battingTeam
            });
            
            this.currentOver = [];
        }
        
        // Calculate overs (e.g., 3.2 means 3 overs and 2 balls)
        const completedOvers = Math.floor(team.balls / 6);
        const remainingBalls = team.balls % 6;
        team.overs = completedOvers + (remainingBalls / 10);
    }

    calculateOverRuns(balls) {
        let runs = 0;
        balls.forEach(ball => {
            if (ball.type === 'runs') {
                runs += ball.value;
            } else if (ball.type === 'extra') {
                // Extract runs from extras like "WD+4" or "NB+6"
                const match = ball.value.match(/\+(\d+)/);
                if (match) {
                    runs += parseInt(match[1]) + 1; // Extra + batsman runs
                } else {
                    runs += 1; // Just the extra
                }
            }
        });
        return runs;
    }

    checkInningsComplete() {
        const team = this.getCurrentTeam();
        const maxWickets = team.players - 1;
        const maxOvers = this.totalOvers;
        
        // Check if innings is over
        const inningsOver = team.wickets >= maxWickets || Math.floor(team.balls / 6) >= maxOvers;
        
        if (inningsOver && !this.firstInningsComplete) {
            // First innings complete
            this.firstInningsComplete = true;
            setTimeout(() => {
                if (confirm(`First innings complete! ${team.name} scored ${team.runs}/${team.wickets}. Switch to second innings?`)) {
                    this.switchInnings();
                }
            }, 500);
        } else if (inningsOver && this.firstInningsComplete) {
            // Second innings complete - match over
            this.matchOver = true;
            this.showMatchResult();
        } else if (this.firstInningsComplete) {
            // Check if chasing team has won
            const battingTeam = this.getCurrentTeam();
            const otherTeam = this.battingTeam === 'A' ? this.teamB : this.teamA;
            
            if (battingTeam.runs > otherTeam.runs) {
                this.matchOver = true;
                this.showMatchResult();
            }
        }
    }

    showMatchResult() {
        const teamAScore = `${this.teamA.runs}/${this.teamA.wickets}`;
        const teamBScore = `${this.teamB.runs}/${this.teamB.wickets}`;
        
        let result = '🏆 MATCH OVER! 🏆\n\n';
        result += `${this.teamA.name}: ${teamAScore} (${this.teamA.overs.toFixed(1)} overs)\n`;
        result += `${this.teamB.name}: ${teamBScore} (${this.teamB.overs.toFixed(1)} overs)\n\n`;
        
        if (this.teamA.runs > this.teamB.runs) {
            const margin = this.teamA.runs - this.teamB.runs;
            result += `${this.teamA.name} won by ${margin} runs!`;
        } else if (this.teamB.runs > this.teamA.runs) {
            const margin = this.teamB.runs - this.teamA.runs;
            const wicketsLeft = (this.teamB.players - 1) - this.teamB.wickets;
            result += `${this.teamB.name} won by ${wicketsLeft} wickets!`;
        } else {
            result += 'Match Tied!';
        }
        
        alert(result);
    }
    
    switchInnings() {
        this.battingTeam = this.battingTeam === 'A' ? 'B' : 'A';
        this.currentOver = [];
        this.extraPending = null;
        this.clearExtraHighlight();
        this.updateDisplay();
    }
    
    saveState() {
        this.history.push({
            teamA: { ...this.teamA },
            teamB: { ...this.teamB },
            battingTeam: this.battingTeam,
            currentOver: [...this.currentOver]
        });
        
        // Keep only last 20 actions
        if (this.history.length > 20) {
            this.history.shift();
        }
    }
    
    undo() {
        if (this.history.length === 0) {
            alert('Nothing to undo!');
            return;
        }
        
        const lastState = this.history.pop();
        this.teamA = { ...lastState.teamA };
        this.teamB = { ...lastState.teamB };
        this.battingTeam = lastState.battingTeam;
        this.currentOver = [...lastState.currentOver];
        this.extraPending = null;
        this.clearExtraHighlight();
        
        this.updateDisplay();
    }
    
    reset() {
        this.teamA.runs = 0;
        this.teamA.wickets = 0;
        this.teamA.balls = 0;
        this.teamA.overs = 0;
        
        this.teamB.runs = 0;
        this.teamB.wickets = 0;
        this.teamB.balls = 0;
        this.teamB.overs = 0;
        
        this.battingTeam = localStorage.getItem('battingFirst') || 'A';
        this.currentOver = [];
        this.history = [];
        this.extraPending = null;
        this.firstInningsComplete = false;
        this.matchOver = false;
        this.oversHistory = [];
        this.clearExtraHighlight();
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Update Team A
        document.getElementById('teamARuns').textContent = this.teamA.runs;
        document.getElementById('teamAWickets').textContent = this.teamA.wickets;
        document.getElementById('teamAOvers').textContent = this.teamA.overs.toFixed(1);
        
        // Update Team B
        document.getElementById('teamBRuns').textContent = this.teamB.runs;
        document.getElementById('teamBWickets').textContent = this.teamB.wickets;
        document.getElementById('teamBOvers').textContent = this.teamB.overs.toFixed(1);
        
        // Update batting team indicator
        const battingTeamName = this.battingTeam === 'A' ? this.teamA.name : this.teamB.name;
        document.getElementById('battingTeam').textContent = battingTeamName;
        
        // Update current over display
        this.updateOverDisplay();
        
        // Update overs history
        this.updateOversHistory();
    }
    
    updateOverDisplay() {
        const overBallsDiv = document.getElementById('overBalls');
        overBallsDiv.innerHTML = '';
        
        this.currentOver.forEach(ball => {
            const ballDiv = document.createElement('div');
            ballDiv.classList.add('ball');
            
            if (ball.type === 'runs') {
                ballDiv.classList.add('runs');
                ballDiv.textContent = ball.value;
            } else if (ball.type === 'wicket') {
                ballDiv.classList.add('wicket');
                ballDiv.textContent = 'W';
            } else if (ball.type === 'extra') {
                ballDiv.classList.add('extra');
                ballDiv.textContent = ball.value;
            }
            
            overBallsDiv.appendChild(ballDiv);
        });
    }
    
    updateOversHistory() {
        const historyDiv = document.getElementById('oversHistory');
        historyDiv.innerHTML = '';
        
        if (this.oversHistory.length === 0) {
            historyDiv.innerHTML = '<p style="color: #999; text-align: center;">No completed overs yet</p>';
            return;
        }
        
        // Group overs by team
        const teamAOvers = this.oversHistory.filter(over => over.team === 'A');
        const teamBOvers = this.oversHistory.filter(over => over.team === 'B');
        
        // Display Team A overs if any
        if (teamAOvers.length > 0) {
            const teamASection = document.createElement('div');
            teamASection.classList.add('team-history-section');
            
            const teamAHeader = document.createElement('h5');
            teamAHeader.style.color = '#667eea';
            teamAHeader.style.marginBottom = '10px';
            teamAHeader.textContent = `${this.teamA.name} - Batting`;
            teamASection.appendChild(teamAHeader);
            
            // Display in reverse order (most recent first)
            [...teamAOvers].reverse().forEach(over => {
                teamASection.appendChild(this.createOverRow(over));
            });
            
            historyDiv.appendChild(teamASection);
        }
        
        // Display Team B overs if any
        if (teamBOvers.length > 0) {
            const teamBSection = document.createElement('div');
            teamBSection.classList.add('team-history-section');
            
            const teamBHeader = document.createElement('h5');
            teamBHeader.style.color = '#667eea';
            teamBHeader.style.marginBottom = '10px';
            teamBHeader.style.marginTop = teamAOvers.length > 0 ? '20px' : '0';
            teamBHeader.textContent = `${this.teamB.name} - Batting`;
            teamBSection.appendChild(teamBHeader);
            
            // Display in reverse order (most recent first)
            [...teamBOvers].reverse().forEach(over => {
                teamBSection.appendChild(this.createOverRow(over));
            });
            
            historyDiv.appendChild(teamBSection);
        }
    }
    
    createOverRow(over) {
        const overRow = document.createElement('div');
        overRow.classList.add('over-row');
        
        const overNumber = document.createElement('div');
        overNumber.classList.add('over-number');
        overNumber.textContent = `Over ${over.overNumber}`;
        overRow.appendChild(overNumber);
        
        const overBalls = document.createElement('div');
        overBalls.classList.add('over-balls');
        
        over.balls.forEach(ball => {
            const ballDiv = document.createElement('div');
            ballDiv.classList.add('ball');
            
            if (ball.type === 'runs') {
                ballDiv.classList.add('runs');
                ballDiv.textContent = ball.value;
            } else if (ball.type === 'wicket') {
                ballDiv.classList.add('wicket');
                ballDiv.textContent = 'W';
            } else if (ball.type === 'extra') {
                ballDiv.classList.add('extra');
                ballDiv.textContent = ball.value;
            }
            
            overBalls.appendChild(ballDiv);
        });
        
        overRow.appendChild(overBalls);
        
        const summary = document.createElement('div');
        summary.classList.add('over-summary');
        summary.textContent = `${over.runs} runs`;
        overRow.appendChild(summary);
        
        return overRow;
    }
}

// Initialize the scorer when page loads
let scorer;
document.addEventListener('DOMContentLoaded', () => {
    scorer = new CricketScorer();
});
