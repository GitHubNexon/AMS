const testreportstruct = {
    title: "Balance Sheet",
    content: [
        {
            title: "ASSETS",
            accs: {A: 3, B: 2, C: 41, D: 2, E: 4},
            calc: "(SUM('A', 'B', 'C')-SUM('D', 'E'))*2"
        }
    ]
};

const accs = {A: 3, B: 2, C: 41, D: 2, E: 4};
const calc = "AVG(:A,:B,:C,:D,:E)";
// 41*3*0.05

console.log(evaluateExpression(accs, calc))




function evaluateExpression(data, expression) {
    // Define supported functions
    const functions = {
        SUM: (...args) => args.reduce((a, b) => a + b, 0),
        AVG: (...args) => args.reduce((a, b) => a + b, 0) / args.length,
        MIN: (...args) => Math.min(...args),
        MAX: (...args) => Math.max(...args),
        PRODUCT: (...args) => args.reduce((a, b) => a * b, 1),
        ABS: (x) => Math.abs(x),
        POWER: (base, exp) => Math.pow(base, exp)
    };
    // Replace variables in the expression with their values from the data object
    expression = expression.replace(/:(\w+)/g, (_, key) => {
        if (key in data) {
            return data[key];
        }
        throw new Error(`Unknown variable ':${key}' in expression.`);
    });
    // Replace functions like SUM() and AVG() with their evaluations
    expression = expression.replace(/(\bSUM|\bAVG)\(([^)]*)\)/g, (_, funcName, args) => {
        const func = functions[funcName];
        if (!func) throw new Error(`Unknown function '${funcName}'.`);
        // Parse arguments (split by commas and convert to numbers)
        const values = args.split(',').map(arg => {
            // Replace variables within the function arguments
            if (arg.trim().startsWith(':')) {
                const varName = arg.trim().slice(1); // Remove the colon
                if (varName in data) {
                    return data[varName];
                }
                throw new Error(`Unknown variable ':${varName}' in function arguments.`);
            }
            return Number(arg.trim());
        });
        return func(...values);
    });
    // Evaluate the arithmetic expression safely
    try {
        return eval(expression);
    } catch (error) {
        throw new Error(`Error evaluating expression: ${error.message}`);
    }
}

