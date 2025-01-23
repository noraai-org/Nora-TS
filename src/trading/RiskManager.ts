export class RiskManager {
    private accountBalance: number;
    private maxRiskPerTrade: number; // as a percentage (e.g., 0.02 for 2%)
    private maxPositionSize: number; // as a percentage (e.g., 0.1 for 10%)

    constructor(
        accountBalance: number,
        maxRiskPerTrade: number = 0.02,
        maxPositionSize: number = 0.1
    ) {
        this.accountBalance = accountBalance;
        this.maxRiskPerTrade = maxRiskPerTrade;
        this.maxPositionSize = maxPositionSize;
    }

    /**
     * Calculate the position size based on risk parameters
     */
    calculatePositionSize(entryPrice: number, stopLoss: number): number {
        const riskAmount = this.accountBalance * this.maxRiskPerTrade;
        const riskPerUnit = Math.abs(entryPrice - stopLoss);
        let positionSize = riskAmount / riskPerUnit;

        // Ensure position size doesn't exceed max allowed
        const maxAllowedSize = this.accountBalance * this.maxPositionSize / entryPrice;
        positionSize = Math.min(positionSize, maxAllowedSize);

        return positionSize;
    }

    /**
     * Update the account balance
     */
    updateBalance(newBalance: number): void {
        this.accountBalance = newBalance;
    }

    /**
     * Calculate potential loss for a given position
     */
    calculatePotentialLoss(positionSize: number, entryPrice: number, stopLoss: number): number {
        return Math.abs(positionSize * (entryPrice - stopLoss));
    }

    /**
     * Check if a trade meets risk management criteria
     */
    public validateTrade(entryPrice: number, stopLoss: number, targetPrice: number): {
        isValid: boolean;
        reason?: string;
    } {
        // Calculate raw risk amount before position sizing
        const riskPerUnit = Math.abs(entryPrice - stopLoss);
        const maxRiskAmount = this.accountBalance * this.maxRiskPerTrade;
        
        // If stop loss is too far from entry price, the raw risk would exceed max risk
        if (riskPerUnit > maxRiskAmount) {
            return {
                isValid: false,
                reason: `Risk amount exceeds maximum allowed risk per trade (${riskPerUnit.toFixed(2)} > ${maxRiskAmount.toFixed(2)})`
            };
        }
    
        // Calculate and validate risk-reward ratio
        const riskRewardRatio = Math.abs(targetPrice - entryPrice) / Math.abs(stopLoss - entryPrice);
        if (riskRewardRatio < 2) {
            return {
                isValid: false,
                reason: "Risk-reward ratio is less than 2:1"
            };
        }
    
        return { isValid: true };
    }

    /**
     * Get current account balance
     */
    getAccountBalance(): number {
        return this.accountBalance;
    }

    /**
     * Get maximum risk per trade as a percentage
     */
    getMaxRiskPerTrade(): number {
        return this.maxRiskPerTrade;
    }
} 