const Barangay = require('../models/Barangay');

// Get all barangays
exports.getAllBarangays = async (req, res) => {
    try {
        const barangays = await Barangay.find();
        const formattedBarangays = barangays.map(barangay => ({
            barangay_id: barangay.barangay_id,
            barangay_name: barangay.barangay_name
        }));
        res.json(formattedBarangays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific barangay by ID
exports.getBarangayById = async (req, res) => {
    try {
        const barangay = await Barangay.findOne({ barangay_id: req.params.id });
        if (!barangay) {
            return res.status(404).json({ message: 'Barangay not found' });
        }
        res.json({
            barangay_id: barangay.barangay_id,
            barangay_name: barangay.barangay_name
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get barangays by municipality ID
exports.getBarangaysByMunicipality = async (req, res) => {
    const municipalityId = req.query.municipality_id;
    try {
        const barangays = await Barangay.find({ municipality_id: municipalityId });
        if (barangays.length === 0) {
            return res.status(404).json({ message: 'No barangays found for this municipality' });
        }
        const formattedBarangays = barangays.map(barangay => ({
            barangay_id: barangay.barangay_id,
            barangay_name: barangay.barangay_name
        }));
        res.json(formattedBarangays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create barangays (if you want to populate the database)
exports.createBarangays = async (req, res) => {
    const barangaysData = req.body;
    try {
        const barangays = await Barangay.insertMany(barangaysData);
        res.status(201).json(barangays);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
