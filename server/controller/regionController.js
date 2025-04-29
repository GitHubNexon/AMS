const Region = require('../models/Region');

// Get all regions
exports.getAllRegions = async (req, res) => {
    try {
        const regions = await Region.find();
        const formattedRegions = regions.map(region => ({
            region_id: region.region_id,
            region_name: region.region_name
        }));
        res.json(formattedRegions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific region by ID
exports.getRegionById = async (req, res) => {
    try {
        const region = await Region.findOne({ region_id: req.params.id });
        if (!region) {
            return res.status(404).json({ message: 'Region not found' });
        }
        res.json({
            region_id: region.region_id,
            region_name: region.region_name
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create regions (if you want to populate the database)
exports.createRegions = async (req, res) => {
    const regionsData = req.body;
    try {
        const regions = await Region.insertMany(regionsData);
        res.status(201).json(regions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
