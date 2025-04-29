const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../helper/tax2.json');

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        const jsonData = JSON.parse(data);

        const updatedData = jsonData.map(item => {
            if (typeof item.taxRate === 'string') {
                item.taxRate = parseFloat(item.taxRate.replace('%', '').trim());
            } else {
                console.warn(`Skipping invalid taxRate for item:`, item);
            }
            return item;
        });

        fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing the file:', err);
            } else {
                console.log('File updated successfully!');
            }
        });
    } catch (parseError) {
        console.error('Error parsing JSON data:', parseError);
    }
});
