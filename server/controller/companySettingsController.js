const CompanySettings = require('../models/companySettingsModel');

// Create or Update Company Settings
exports.createOrUpdateSettings = async (req, res) => {
  try {
    const {
      companyName,
      companyType,
      companyLogo,
      companyEmail,
      companyPhone,
      companyWebsite,
      streetAddress,
      city,
      region,
      barangay,
      zipCode
    } = req.body;

    let companySettings = await CompanySettings.findOne();

    if (companySettings) {
      companySettings = await CompanySettings.findByIdAndUpdate(
        companySettings._id,
        {
          companyName,
          companyType,
          companyLogo,
          companyEmail,
          companyPhone,
          companyWebsite,
          streetAddress,
          city,
          region,
          barangay,
          zipCode
        },
        { new: true }
      );
    } else {
      companySettings = new CompanySettings({
        companyName,
        companyType,
        companyLogo,
        companyEmail,
        companyPhone,
        companyWebsite,
        streetAddress,
        city,
        region,
        barangay,
        zipCode
      });
      await companySettings.save();
    }

    res.status(200).json(companySettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Company Settings
exports.getCompanySettings = async (req, res) => {
  try {
    const companySettings = await CompanySettings.findOne();
    if (!companySettings) {
      return res.status(404).json({ message: 'Company settings not found' });
    }
    res.status(200).json(companySettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Company Settings
exports.updateCompanySettings = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      companyName,
      companyType,
      companyLogo,
      companyEmail,
      companyPhone,
      companyWebsite,
      streetAddress,
      city,
      region,
      barangay,
      zipCode
    } = req.body;

    const companySettings = await CompanySettings.findByIdAndUpdate(
      id,
      {
        companyName,
        companyType,
        companyLogo,
        companyEmail,
        companyPhone,
        companyWebsite,
        streetAddress,
        city,
        region,
        barangay,
        zipCode
      },
      { new: true }
    );

    if (!companySettings) {
      return res.status(404).json({ message: 'Company settings not found' });
    }

    res.status(200).json(companySettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
