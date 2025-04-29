const Municipality = require('../models/Municipality');

// Get all municipalities
exports.getAllMunicipalities = async (req, res) => {
    try {
        const municipalities = await Municipality.find();
        const formattedMunicipalities = municipalities.map(municipality => ({
            municipality_id: municipality.municipality_id,
            municipality_name: municipality.municipality_name
        }));
        res.json(formattedMunicipalities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific municipality by ID
exports.getMunicipalityById = async (req, res) => {
    try {
        const municipality = await Municipality.findOne({ municipality_id: req.params.id });
        if (!municipality) {
            return res.status(404).json({ message: 'Municipality not found' });
        }
        res.json({
            municipality_id: municipality.municipality_id,
            municipality_name: municipality.municipality_name
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getMunicipalitiesByProvince = async (req, res) => {
    const provinceId = req.query.province_id;
    try {
        const municipalities = await Municipality.find({ province_id: provinceId });
        const formattedMunicipalities = municipalities.map(municipality => ({
            municipality_id: municipality.municipality_id,
            municipality_name: municipality.municipality_name
        }));
        res.json(formattedMunicipalities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create municipalities (if you want to populate the database)
exports.createMunicipalities = async (req, res) => {
    const municipalitiesData = req.body;
    try {
        const municipalities = await Municipality.insertMany(municipalitiesData);
        res.status(201).json(municipalities);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
