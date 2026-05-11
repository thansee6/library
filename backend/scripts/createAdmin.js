const { User, sequelize } = require('../models');

const createAdmin = async () => {
  try {
    await sequelize.sync();
    
    const existingAdmin = await User.findOne({ where: { email: 'admin@admin.com' } });
    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@admin.com');
      process.exit(0);
    }

    await User.create({
      username: 'admin',
      email: 'admin@admin.com',
      password: 'password123',
      role: 'admin'
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@admin.com');
    console.log('Password: password123');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin();
