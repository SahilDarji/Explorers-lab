// Utility functions for correlation calculations

// Calculate mean of an array
function calculateMean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

// Calculate standard deviation
function calculateSD(arr, mean) {
    const squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / arr.length);
}

// Calculate variance
function calculateVariance(arr, mean) {
    const squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / arr.length;
}

// Calculate covariance
function calculateCovariance(xArr, yArr, xMean, yMean) {
    const n = xArr.length;
    const products = xArr.map((x, i) => (x - xMean) * (yArr[i] - yMean));
    return products.reduce((sum, val) => sum + val, 0) / n;
}

// Calculate correlation using raw scores method
function calculateCorrelationRawScores(xArr, yArr) {
    const n = xArr.length;
    const sumX = xArr.reduce((sum, val) => sum + val, 0);
    const sumY = yArr.reduce((sum, val) => sum + val, 0);
    const sumXY = xArr.reduce((sum, x, i) => sum + x * yArr[i], 0);
    const sumX2 = xArr.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = yArr.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return numerator / denominator;
}

// Calculate correlation using mean-deviation method
function calculateCorrelationMeanDeviation(xArr, yArr) {
    const xMean = calculateMean(xArr);
    const yMean = calculateMean(yArr);
    
    const numerator = xArr.reduce((sum, x, i) => sum + (x - xMean) * (yArr[i] - yMean), 0);
    const xDevSquared = xArr.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);
    const yDevSquared = yArr.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    
    return numerator / Math.sqrt(xDevSquared * yDevSquared);
}

// Calculate correlation using covariance method
function calculateCorrelationCovariance(xArr, yArr) {
    const xMean = calculateMean(xArr);
    const yMean = calculateMean(yArr);
    const xSD = calculateSD(xArr, xMean);
    const ySD = calculateSD(yArr, yMean);
    const covariance = calculateCovariance(xArr, yArr, xMean, yMean);
    
    return covariance / (xSD * ySD);
}

// Calculate correlation using Assumed Mean method
// Returns an object with correlation and intermediate sums for step-by-step display
function calculateCorrelationAssumedMean(xArr, yArr, assumedA, assumedB) {
    if (xArr.length !== yArr.length) {
        throw new Error("X and Y arrays must have the same length for assumed mean calculation.");
    }
    // Ensure assumedA and assumedB are numbers, default to 0 if not valid, though UI should ensure they are numbers or empty
    const A = typeof assumedA === 'number' && !isNaN(assumedA) ? assumedA : 0;
    const B = typeof assumedB === 'number' && !isNaN(assumedB) ? assumedB : 0;

    const uValues = xArr.map(x => x - A);
    const vValues = yArr.map(y => y - B);

    const n = uValues.length;
    if (n === 0) { // Handle case with no data after filtering empty inputs
        return { correlation: NaN, uValues:[], vValues:[], sumU:0, sumV:0, sumU2:0, sumV2:0, sumUV:0, n:0 };
    }
    
    const sumU = uValues.reduce((sum, val) => sum + val, 0);
    const sumV = vValues.reduce((sum, val) => sum + val, 0);
    const sumUV = uValues.reduce((sum, u, i) => sum + u * vValues[i], 0);
    const sumU2 = uValues.reduce((sum, val) => sum + val * val, 0);
    const sumV2 = vValues.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumUV - sumU * sumV;
    const denominator = Math.sqrt((n * sumU2 - sumU * sumU) * (n * sumV2 - sumV * sumV));

    let correlation = NaN; // Default to NaN
    if (denominator !== 0) {
        correlation = numerator / denominator;
    }
    
    return { correlation, uValues, vValues, sumU, sumV, sumU2, sumV2, sumUV, n };
}

// Get correlation interpretation
function getCorrelationInterpretation(r) {
    const absR = Math.abs(r);
    let strength, direction;
    
    if (absR >= 0.9) strength = "very strong";
    else if (absR >= 0.7) strength = "strong";
    else if (absR >= 0.5) strength = "moderate";
    else if (absR >= 0.3) strength = "weak";
    else strength = "very weak";
    
    direction = r > 0 ? "positive" : "negative";
    
    return `${strength} ${direction} correlation`;
}

// Format number to specified decimal places
function formatNumber(num, decimals = 4) {
    if (typeof num === 'number' && !isNaN(num)) {
        return Number(num.toFixed(decimals));
    }
    return '--'; // Return a placeholder if num is not a valid number
}

// Validate input arrays
function validateInputs(xArr, yArr) {
    if (xArr.length !== yArr.length) {
        throw new Error("X and Y arrays must have the same length");
    }
    if (xArr.length < 2) {
        throw new Error("At least 2 data points are required");
    }
    if (xArr.some(isNaN) || yArr.some(isNaN)) {
        throw new Error("All values must be numbers");
    }
}

// Export all functions
export {
    calculateMean,
    calculateSD,
    calculateVariance,
    calculateCovariance,
    calculateCorrelationRawScores,
    calculateCorrelationMeanDeviation,
    calculateCorrelationCovariance,
    calculateCorrelationAssumedMean,
    getCorrelationInterpretation,
    formatNumber,
    validateInputs
};
