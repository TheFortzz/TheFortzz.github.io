// Script Syntax Highlighter for Tank Map Creator
class ScriptSyntaxHighlighter {
    constructor() {
        this.keywords = [
            'function', 'end', 'if', 'then', 'else', 'elseif', 'while', 'do', 'for', 'in', 'repeat', 'until',
            'local', 'return', 'break', 'and', 'or', 'not', 'true', 'false', 'nil'
        ];
        
        this.tankFunctions = [
            'onBattleStart', 'onTankSpawn', 'onTankDestroyed', 'onTankCollision',
            'spawnTank', 'giveTankWeapon', 'upgradeTankArmor', 'setTankSpeed',
            'spawnTankPowerUp', 'createTankBarrier', 'activateTankTurret',
            'getTanksInArea', 'rewardKiller', 'endBattle'
        ];
        
        this.generalFunctions = [
            'showMessage', 'playSound', 'spawnExplosion', 'createCrater',
            'playTankSound', 'setTimer', 'getObject', 'moveObject', 'destroyObject',
            'randomPosition', 'distance', 'random'
        ];
        
        this.colors = {
            keyword: '#569CD6',      // Blue
            tankFunction: '#4EC9B0', // Teal
            generalFunction: '#DCDCAA', // Yellow
            string: '#CE9178',       // Orange
            comment: '#6A9955',      // Green
            number: '#B5CEA8',       // Light green
            operator: '#D4D4D4',     // Light gray
            default: '#D4D4D4'       // Light gray
        };
    }

    highlight(code) {
        if (!code) return '';
        
        let highlighted = code;
        
        // Highlight comments first (so they don't interfere with other highlighting)
        highlighted = highlighted.replace(/(--.*$)/gm, `<span style="color: ${this.colors.comment}">$1</span>`);
        
        // Highlight strings
        highlighted = highlighted.replace(/(['"])((?:(?!\1)[^\\]|\\.)*)(\1)/g, 
            `<span style="color: ${this.colors.string}">$1$2$3</span>`);
        
        // Highlight numbers
        highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, 
            `<span style="color: ${this.colors.number}">$1</span>`);
        
        // Highlight keywords
        this.keywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
            highlighted = highlighted.replace(regex, 
                `<span style="color: ${this.colors.keyword}; font-weight: bold;">$1</span>`);
        });
        
        // Highlight tank-specific functions
        this.tankFunctions.forEach(func => {
            const regex = new RegExp(`\\b(${func})\\b`, 'g');
            highlighted = highlighted.replace(regex, 
                `<span style="color: ${this.colors.tankFunction}; font-weight: bold;">$1</span>`);
        });
        
        // Highlight general functions
        this.generalFunctions.forEach(func => {
            const regex = new RegExp(`\\b(${func})\\b`, 'g');
            highlighted = highlighted.replace(regex, 
                `<span style="color: ${this.colors.generalFunction}">$1</span>`);
        });
        
        // Highlight operators
        highlighted = highlighted.replace(/([+\-*/%=<>!&|]+)/g, 
            `<span style="color: ${this.colors.operator}">$1</span>`);
        
        return highlighted;
    }

    setupEditor() {
        const textarea = document.getElementById('mapScriptEditor');
        const highlightDiv = document.getElementById('syntaxHighlight');
        
        if (!textarea || !highlightDiv) return;
        
        const updateHighlighting = () => {
            const code = textarea.value;
            const highlighted = this.highlight(code);
            highlightDiv.innerHTML = highlighted;
            
            // Sync scroll position
            highlightDiv.scrollTop = textarea.scrollTop;
            highlightDiv.scrollLeft = textarea.scrollLeft;
        };
        
        // Update highlighting on input
        textarea.addEventListener('input', updateHighlighting);
        textarea.addEventListener('scroll', () => {
            highlightDiv.scrollTop = textarea.scrollTop;
            highlightDiv.scrollLeft = textarea.scrollLeft;
        });
        
        // Initial highlighting
        updateHighlighting();
        
        // Add line numbers
        this.addLineNumbers(textarea);
    }
    
    addLineNumbers(textarea) {
        const wrapper = textarea.parentElement;
        
        // Create line numbers container
        const lineNumbers = document.createElement('div');
        lineNumbers.id = 'lineNumbers';
        lineNumbers.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 40px;
            height: 100%;
            background: rgba(0,0,0,0.3);
            border-right: 1px solid rgba(0,247,255,0.3);
            font-family: 'Fira Code', 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.5;
            color: rgba(255,255,255,0.4);
            padding: 15px 5px;
            box-sizing: border-box;
            text-align: right;
            user-select: none;
            pointer-events: none;
            overflow: hidden;
        `;
        
        // Adjust textarea padding to make room for line numbers
        textarea.style.paddingLeft = '50px';
        document.getElementById('syntaxHighlight').style.paddingLeft = '50px';
        
        const updateLineNumbers = () => {
            const lines = textarea.value.split('\n').length;
            let lineNumbersHTML = '';
            for (let i = 1; i <= lines; i++) {
                lineNumbersHTML += i + '\n';
            }
            lineNumbers.textContent = lineNumbersHTML;
            
            // Sync scroll
            lineNumbers.scrollTop = textarea.scrollTop;
        };
        
        textarea.addEventListener('input', updateLineNumbers);
        textarea.addEventListener('scroll', () => {
            lineNumbers.scrollTop = textarea.scrollTop;
        });
        
        wrapper.appendChild(lineNumbers);
        updateLineNumbers();
    }
}

// Initialize syntax highlighter when script editor is shown
function initializeSyntaxHighlighter() {
    if (!window.scriptHighlighter) {
        window.scriptHighlighter = new ScriptSyntaxHighlighter();
    }
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        window.scriptHighlighter.setupEditor();
    }, 100);
}

// Auto-initialize when script is loaded
if (typeof window !== 'undefined') {
    window.initializeSyntaxHighlighter = initializeSyntaxHighlighter;
}