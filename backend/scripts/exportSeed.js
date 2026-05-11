
const { sequelize, User, Book, Author, Category, Borrowing, Payment, SystemSetting } = require('../models');

const exportData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to local database');

   
    const users = await User.findAll({ raw: true });
    const authors = await Author.findAll({ raw: true });
    const categories = await Category.findAll({ raw: true });
    const books = await Book.findAll({ raw: true });
    const borrowings = await Borrowing.findAll({ raw: true });
    const payments = await Payment.findAll({ raw: true });

    let settings = [];
    try {
      settings = await SystemSetting.findAll({ raw: true });
    } catch (e) {
      console.log('No SystemSettings table, skipping...');
    }

    
    const seedScript = `
const { sequelize, User, Book, Author, Category, Borrowing, Payment, SystemSetting } = require('../models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Sync tables
    await sequelize.sync({ force: true });
    console.log('Tables created');

    // ── Authors ──
    const authors = ${JSON.stringify(authors.map(a => ({ id: a.id, name: a.name, createdAt: a.createdAt, updatedAt: a.updatedAt })), null, 2)};
    for (const a of authors) {
      await Author.create(a);
    }
    console.log('Authors seeded:', authors.length);

    // ── Categories ──
    const categories = ${JSON.stringify(categories.map(c => ({ id: c.id, name: c.name, createdAt: c.createdAt, updatedAt: c.updatedAt })), null, 2)};
    for (const c of categories) {
      await Category.create(c);
    }
    console.log('Categories seeded:', categories.length);

    // ── Users (with pre-hashed passwords) ──
    const users = ${JSON.stringify(users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      password: u.password,  
      role: u.role,
      isActive: u.isActive,
      subscriptionStatus: u.subscriptionStatus,
      subscriptionExpiresAt: u.subscriptionExpiresAt,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    })), null, 2)};
    // Insert users with raw query to avoid re-hashing passwords
    for (const u of users) {
      await sequelize.query(
        \`INSERT INTO "Users" (id, username, email, password, role, "isActive", "subscriptionStatus", "subscriptionExpiresAt", "createdAt", "updatedAt")
         VALUES (:id, :username, :email, :password, :role, :isActive, :subscriptionStatus, :subscriptionExpiresAt, :createdAt, :updatedAt)\`,
        { replacements: u }
      );
    }
    console.log('Users seeded:', users.length);

    // ── Books ──
    const books = ${JSON.stringify(books.map(b => ({
      id: b.id,
      title: b.title,
      isbn: b.isbn,
      stock: b.stock,
      coverImage: b.coverImage,
      authorId: b.authorId,
      categoryId: b.categoryId,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt
    })), null, 2)};
    for (const b of books) {
      await Book.create(b);
    }
    console.log('Books seeded:', books.length);

    // ── Borrowings ──
    const borrowings = ${JSON.stringify(borrowings.map(br => ({
      id: br.id,
      userId: br.userId,
      bookId: br.bookId,
      status: br.status,
      borrowDate: br.borrowDate,
      dueDate: br.dueDate,
      returnDate: br.returnDate,
      createdAt: br.createdAt,
      updatedAt: br.updatedAt
    })), null, 2)};
    for (const br of borrowings) {
      await Borrowing.create(br);
    }
    console.log('Borrowings seeded:', borrowings.length);

    // ── Payments ──
    const payments = ${JSON.stringify(payments.map(p => ({
      id: p.id,
      userId: p.userId,
      amount: p.amount,
      status: p.status,
      razorpayOrderId: p.razorpayOrderId,
      razorpayPaymentId: p.razorpayPaymentId,
      invoiceNumber: p.invoiceNumber,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    })), null, 2)};
    for (const p of payments) {
      await Payment.create(p);
    }
    console.log('Payments seeded:', payments.length);

    console.log('\\n✅ Database seeded successfully!');
    console.log('Admin login: admin@admin.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
`;

    const fs = require('fs');
    fs.writeFileSync(__dirname + '/seed.js', seedScript);
    console.log('\\n✅ Seed script generated: scripts/seed.js');
    console.log(`   Users: ${users.length}`);
    console.log(`   Authors: ${authors.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Books: ${books.length}`);
    console.log(`   Borrowings: ${borrowings.length}`);
    console.log(`   Payments: ${payments.length}`);
    process.exit(0);
  } catch (err) {
    console.error('Export error:', err);
    process.exit(1);
  }
};

exportData();
