// Cricket Score Tracker Logic
class CricketScorer {
    constructor() {
        this.teamA = {
            name: localStorage.getItem('teamAName') || 'Team A',
            runs: 0,
            wickets: 0,
            balls: 0,
            overs: 0
        };
        
        this.teamB = {
            name: localStorage.getItem('teamBName') || 'Team B',
            runs: 0,
            wickets: 0,
            balls: 0,
            overs: 0
        };
        
        this.battingTeam = 'A';
        this.currentOver = [];
        this.history = [];
        this.extraPending = null; // Track if Wide or No Ball was clicked
        
        this.init();
    }
    
    init() {
        // Update team names from localStorage
        document.getElementById('teamAName').textContent = this.teamA.name;
        document.getElementById('teamBName').textContent = this.teamB.name;
        
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
        const team = this.getCurrentTeam();
        
        if (team.wickets >= 10) {
            alert('All out! Please switch innings.');
            return;
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
        this.updateDisplay();
    }
    
    checkOverComplete() {
        const team = this.getCurrentTeam();
        
        if (team.balls % 6 === 0 && team.balls > 0) {
            // Over complete
            this.currentOver = [];
        }
        
        // Calculate overs (e.g., 3.2 means 3 overs and 2 balls)
        const completedOvers = Math.floor(team.balls / 6);
        const remainingBalls = team.balls % 6;
        team.overs = completedOvers + (remainingBalls / 10);
    }
    
    switchInnings() {
        if (confirm('Switch batting team?')) {
            this.battingTeam = this.battingTeam === 'A' ? 'B' : 'A';
            this.currentOver = [];
            this.extraPending = null;
            this.clearExtraHighlight();
            this.updateDisplay();
        }
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
        
        this.battingTeam = 'A';
        this.currentOver = [];
        this.history = [];
        this.extraPending = null;
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
}

// Initialize the scorer when page loads
let scorer;
document.addEventListener('DOMContentLoaded', () => {
    scorer = new CricketScorer();
});
