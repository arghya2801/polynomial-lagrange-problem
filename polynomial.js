const fs = require('fs');

function convertToDecimal(value, base) {
    return BigInt(parseInt(value, base));
}

function lagrangeInterpolation(points) {
    const n = points.length;
    
    const coefficients = new Array(n).fill(0n);
    
    for (let i = 0; i < n; i++) {
        const xi = points[i].x;
        const yi = points[i].y;
        
        let basisCoeffs = [1n];
        let denominator = 1n;
        
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                const xj = points[j].x;
                
                const newCoeffs = new Array(basisCoeffs.length + 1).fill(0n);
                
                for (let k = 0; k < basisCoeffs.length; k++) {
                    newCoeffs[k + 1] += basisCoeffs[k];
                }
                
                for (let k = 0; k < basisCoeffs.length; k++) {
                    newCoeffs[k] -= basisCoeffs[k] * xj;
                }
                
                basisCoeffs = newCoeffs;
                denominator *= (xi - xj);
            }
        }
        
        for (let k = 0; k < basisCoeffs.length; k++) {
            if (basisCoeffs[k] !== 0n) {
                const numerator = yi * basisCoeffs[k];
                coefficients[k] += numerator / denominator;
            }
        }
    }
    
    return coefficients;
}

if (process.argv.length < 3) {
    console.log('Usage: node polynomial.js <json_file>');
    process.exit(1);
}

const filename = process.argv[2];

try {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    const points = [];
    
    if (data.keys) {
        const n = data.keys.n;
        const k = data.keys.k;
        
        for (let i = 1; i <= n; i++) {
            if (data[i.toString()]) {
                const point = data[i.toString()];
                const x = BigInt(i);
                const y = convertToDecimal(point.value, parseInt(point.base));
                points.push({ x, y });
            }
        }
        
        const selectedPoints = points.slice(0, k);
        
        const coefficients = lagrangeInterpolation(selectedPoints);
        
        const secret = coefficients[0] || 0n;
        
        console.log(secret.toString());
    } else {
        throw new Error('Invalid JSON format');
    }
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}