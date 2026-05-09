const { SystemSetting } = require('../models');

const seedDefaults = async () => {
  const defaults = [
    { key: 'borrowLimit', value: '3' },
    { key: 'borrowDuration', value: '14' },
    { key: 'fineRate', value: '0.50' },
    { key: 'enableChat', value: 'true' }
  ];

  for (const d of defaults) {
    await SystemSetting.findOrCreate({
      where: { key: d.key },
      defaults: { value: d.value }
    });
  }
};

exports.getSettings = async (req, res) => {
  try {
    await seedDefaults();
    const settingsList = await SystemSetting.findAll();
    const settingsMap = {};
    settingsList.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    res.json({ success: true, data: settingsMap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    for (const key of Object.keys(settings)) {
      await SystemSetting.upsert({ key, value: String(settings[key]) });
    }
    res.json({ success: true, message: 'System settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
