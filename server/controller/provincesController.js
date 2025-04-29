const Province = require("../models/Province");

// Get all provinces
exports.getAllProvinces = async (req, res) => {
    try {
        const provinces = await Province.find();
        const formattedProvinces = provinces.map(province => ({
            province_id: province.province_id,
            province_name: province.province_name
        }));
        res.json(formattedProvinces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific province by ID
exports.getProvinceById = async (req, res) => {
    try {
        const province = await Province.findOne({ province_id: req.params.id });
        if (!province) {
            return res.status(404).json({ message: 'Province not found' });
        }
        res.json(province);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get provinces by region ID
exports.getProvincesByRegion = async (req, res) => {
    const regionId = req.query.region_id;
    try {
        const provinces = await Province.find({ region_id: regionId });
        const formattedProvinces = provinces.map(province => ({
            province_id: province.province_id,
            province_name: province.province_name
        }));
        res.json(formattedProvinces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create provinces
exports.createProvinces = async (req, res) => {
    const provincesData = req.body;
    try {
        const provinces = await Province.insertMany(provincesData);
        res.status(201).json(provinces);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
