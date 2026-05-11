
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
    const authors = [
  {
    "id": "b9e7d6e0-24ae-4b09-aa9e-6c55bc037a7f",
    "name": "F. Scott Fitzgerald",
    "createdAt": "2026-05-04T06:56:25.057Z",
    "updatedAt": "2026-05-04T06:56:25.057Z"
  },
  {
    "id": "a7b20ae7-8418-44ea-8e87-f6a2c32fc1ea",
    "name": "George Orwell",
    "createdAt": "2026-05-04T06:56:25.057Z",
    "updatedAt": "2026-05-04T06:56:25.057Z"
  },
  {
    "id": "182e9a3d-ecad-45d9-b816-a891a2b6023c",
    "name": "J.R.R. Tolkien",
    "createdAt": "2026-05-04T06:56:25.057Z",
    "updatedAt": "2026-05-04T06:56:25.057Z"
  },
  {
    "id": "e04a469f-173c-4d09-a8ae-d15ce5cb1d68",
    "name": "Harper Lee",
    "createdAt": "2026-05-04T06:56:25.057Z",
    "updatedAt": "2026-05-04T06:56:25.057Z"
  },
  {
    "id": "0683c9bf-cabe-42c3-a170-d8cdfadc19d6",
    "name": "Frank Herbert",
    "createdAt": "2026-05-04T06:56:25.057Z",
    "updatedAt": "2026-05-04T06:56:25.057Z"
  },
  {
    "id": "e6e0b06a-c03c-4077-8dd9-11bca3e2555d",
    "name": "Test Author",
    "createdAt": "2026-05-09T17:36:39.934Z",
    "updatedAt": "2026-05-09T17:36:39.934Z"
  },
  {
    "id": "e2826814-ffad-411b-bd99-230400480c09",
    "name": "Test Author",
    "createdAt": "2026-05-09T17:37:22.791Z",
    "updatedAt": "2026-05-09T17:37:22.791Z"
  },
  {
    "id": "8e9eb6b7-8ada-4940-859e-7de0dc94dd31",
    "name": "Debug Author",
    "createdAt": "2026-05-09T17:38:58.308Z",
    "updatedAt": "2026-05-09T17:38:58.308Z"
  },
  {
    "id": "7a10c0da-4dd2-4dc2-8c3c-81123d378384",
    "name": "Final Test Author",
    "createdAt": "2026-05-09T17:49:43.633Z",
    "updatedAt": "2026-05-09T17:49:43.633Z"
  }
];
    for (const a of authors) {
      await Author.create(a);
    }
    console.log('Authors seeded:', authors.length);

    // ── Categories ──
    const categories = [
  {
    "id": "65271525-6378-403c-beb9-2c32f9a892d2",
    "name": "Classic",
    "createdAt": "2026-05-04T06:56:25.040Z",
    "updatedAt": "2026-05-04T06:56:25.040Z"
  },
  {
    "id": "5375e0dd-886b-48e9-a8af-6eaeb25d8ca6",
    "name": "Science Fiction",
    "createdAt": "2026-05-04T06:56:25.040Z",
    "updatedAt": "2026-05-04T06:56:25.040Z"
  },
  {
    "id": "fc9f238e-331d-4107-89ac-0f3f89c16365",
    "name": "Fantasy",
    "createdAt": "2026-05-04T06:56:25.040Z",
    "updatedAt": "2026-05-04T06:56:25.040Z"
  },
  {
    "id": "a16cd74a-4e27-43d3-b681-e8765de4bef5",
    "name": "Dystopian",
    "createdAt": "2026-05-04T06:56:25.040Z",
    "updatedAt": "2026-05-04T06:56:25.040Z"
  },
  {
    "id": "66aeacfc-d1de-4cd1-bd49-232d926a4efb",
    "name": "Mystery",
    "createdAt": "2026-05-04T06:56:25.040Z",
    "updatedAt": "2026-05-04T06:56:25.040Z"
  },
  {
    "id": "6a92a8e3-1088-4700-88d3-d4d3a43b8f45",
    "name": "Test Category",
    "createdAt": "2026-05-09T17:36:39.952Z",
    "updatedAt": "2026-05-09T17:36:39.952Z"
  },
  {
    "id": "bdaf08ce-13c9-4f8d-bef3-1c3c83182fe0",
    "name": "Debug Category",
    "createdAt": "2026-05-09T17:38:58.323Z",
    "updatedAt": "2026-05-09T17:38:58.323Z"
  },
  {
    "id": "6ffb3a81-fe39-45a1-a627-8692415ad066",
    "name": "Final Test Category",
    "createdAt": "2026-05-09T17:49:43.646Z",
    "updatedAt": "2026-05-09T17:49:43.646Z"
  }
];
    for (const c of categories) {
      await Category.create(c);
    }
    console.log('Categories seeded:', categories.length);

    // ── Users (with pre-hashed passwords) ──
    const users = [
  {
    "id": "bb32f83d-9a07-4b22-a22e-320c0b0e3934",
    "username": "admin",
    "email": "admin@admin.com",
    "password": "$2b$10$arcQZs4gZPnxdVOHbeFxm..pO1750afQ52MV6/D1NJRp1.WE.Vx4m",
    "role": "admin",
    "isActive": true,
    "subscriptionStatus": "inactive",
    "subscriptionExpiresAt": null,
    "createdAt": "2026-05-05T15:32:37.959Z",
    "updatedAt": "2026-05-05T15:49:46.302Z"
  },
  {
    "id": "ef5b8bcf-a689-434b-916d-12ce40e01df4",
    "username": "thanseeh",
    "email": "thanseeh756@gmail.com",
    "password": "$2b$10$qsbU6aQ8p4SVpV2vzvx03.yPjovrV4geCk19LfK2MjJuFjHY3mJeq",
    "role": "member",
    "isActive": true,
    "subscriptionStatus": "inactive",
    "subscriptionExpiresAt": null,
    "createdAt": "2026-05-04T07:34:53.812Z",
    "updatedAt": "2026-05-09T17:15:36.417Z"
  },
  {
    "id": "9716fb9a-5aa8-4257-8f92-f62e84b9a73f",
    "username": "testuser",
    "email": "test@example.com",
    "password": "$2b$10$l5g3wc5uYKfgVdh42z/eIuv3hHQW7rNRVN6o7dvviip9TvAn0GgiC",
    "role": "member",
    "isActive": true,
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2026-06-08T17:33:04.483Z",
    "createdAt": "2026-05-09T17:33:03.712Z",
    "updatedAt": "2026-05-09T17:33:04.484Z"
  },
  {
    "id": "e4ba7ce5-a569-43a9-93ff-5214775b068f",
    "username": "member",
    "email": "member@example.com",
    "password": "$2b$10$IHKtQ82/Dc1EvOAiNB.0buxoCYTU3osgeieVSk3trLta3K5rVNtFy",
    "role": "member",
    "isActive": true,
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2026-06-08T17:33:26.736Z",
    "createdAt": "2026-05-09T17:33:26.393Z",
    "updatedAt": "2026-05-09T17:33:26.736Z"
  },
  {
    "id": "6aec5e55-3546-4d7e-8fb6-6ae2671351cf",
    "username": "testadmin",
    "email": "admin@test.com",
    "password": "$2b$10$RBwnVIuQ4cp0KUk53ybjr.MRM3wJKs12wmQv.1iaaJn3TL9E4wP3e",
    "role": "admin",
    "isActive": true,
    "subscriptionStatus": "inactive",
    "subscriptionExpiresAt": null,
    "createdAt": "2026-05-09T17:36:39.538Z",
    "updatedAt": "2026-05-09T17:36:39.538Z"
  },
  {
    "id": "d80a65ae-abc1-413c-b2f3-67a7494e8e18",
    "username": "testmember",
    "email": "member@test.com",
    "password": "$2b$10$75QsJWWUnL6UcvP45wwX9OfSLYKuIA.9vVY/HGBFuzpKdtRujxPLO",
    "role": "member",
    "isActive": true,
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2026-07-08T17:36:40.129Z",
    "createdAt": "2026-05-09T17:36:39.746Z",
    "updatedAt": "2026-05-09T17:37:22.975Z"
  },
  {
    "id": "b77b2f5f-0042-4584-b296-9ea1281017d5",
    "username": "debugadmin",
    "email": "debug@admin.com",
    "password": "$2b$10$HfOnKD4VW/hNfRr6blI2oueYYJpAJK3n/p1CpZWzvcRy8E/vYYoCm",
    "role": "admin",
    "isActive": true,
    "subscriptionStatus": "inactive",
    "subscriptionExpiresAt": null,
    "createdAt": "2026-05-09T17:38:58.112Z",
    "updatedAt": "2026-05-09T17:38:58.112Z"
  },
  {
    "id": "151aa394-1ad1-42df-92d9-244827c9f677",
    "username": "debugmember",
    "email": "debug@member.com",
    "password": "$2b$10$0CtHMb4JuZUCCAvrI4.1BuezzOMTmLNDe0Oz2rRiKb8NaE9ZlCMYO",
    "role": "member",
    "isActive": true,
    "subscriptionStatus": "inactive",
    "subscriptionExpiresAt": null,
    "createdAt": "2026-05-09T17:38:58.433Z",
    "updatedAt": "2026-05-09T17:38:58.433Z"
  },
  {
    "id": "d68f8af8-1bab-4c72-b071-5abaae24db85",
    "username": "finaladmin",
    "email": "final@admin.com",
    "password": "$2b$10$K3ihwYxo6nxlNdM5Q2Qc3eF0nSLw7tKTuX9eVxgQF8tOl/0R4DuYi",
    "role": "admin",
    "isActive": true,
    "subscriptionStatus": "inactive",
    "subscriptionExpiresAt": null,
    "createdAt": "2026-05-09T17:49:43.244Z",
    "updatedAt": "2026-05-09T17:49:43.244Z"
  },
  {
    "id": "031b4374-0ac9-4ea7-8078-f93b1953da78",
    "username": "finalmember",
    "email": "final@member.com",
    "password": "$2b$10$A8GBczzkJ9Fs3fcl9XNTLerBZU/2PAdaSG4b1/.xGK6XapdpZ4LsK",
    "role": "member",
    "isActive": true,
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": "2026-06-08T17:49:43.800Z",
    "createdAt": "2026-05-09T17:49:43.472Z",
    "updatedAt": "2026-05-09T17:49:43.801Z"
  }
];
    // Insert users with raw query to avoid re-hashing passwords
    for (const u of users) {
      await sequelize.query(
        `INSERT INTO "Users" (id, username, email, password, role, "isActive", "subscriptionStatus", "subscriptionExpiresAt", "createdAt", "updatedAt")
         VALUES (:id, :username, :email, :password, :role, :isActive, :subscriptionStatus, :subscriptionExpiresAt, :createdAt, :updatedAt)`,
        { replacements: u }
      );
    }
    console.log('Users seeded:', users.length);

    // ── Books ──
    const books = [
  {
    "id": "bbb17cd4-f974-46a5-940b-9caced164bf0",
    "title": "The Hobbit",
    "isbn": "9780547928227",
    "stock": 8,
    "coverImage": "/uploads/books/book-1778173218502-176699719.png",
    "authorId": "182e9a3d-ecad-45d9-b816-a891a2b6023c",
    "categoryId": "fc9f238e-331d-4107-89ac-0f3f89c16365",
    "createdAt": "2026-05-04T06:56:25.064Z",
    "updatedAt": "2026-05-07T17:00:18.519Z"
  },
  {
    "id": "7a366fe2-311b-4c43-9103-c3b3fa535e5a",
    "title": "1984",
    "isbn": "9780451524935",
    "stock": 10,
    "coverImage": "/uploads/books/book-1778173227935-184623908.png",
    "authorId": "a7b20ae7-8418-44ea-8e87-f6a2c32fc1ea",
    "categoryId": "a16cd74a-4e27-43d3-b681-e8765de4bef5",
    "createdAt": "2026-05-04T06:56:25.064Z",
    "updatedAt": "2026-05-07T17:00:27.945Z"
  },
  {
    "id": "4289d99a-28ed-4bdd-9be8-f292cf2b07ce",
    "title": "To Kill a Mockingbird",
    "isbn": "9780061120084",
    "stock": 12,
    "coverImage": "/uploads/books/book-1778155469552-403438540.png",
    "authorId": "e04a469f-173c-4d09-a8ae-d15ce5cb1d68",
    "categoryId": "65271525-6378-403c-beb9-2c32f9a892d2",
    "createdAt": "2026-05-04T06:56:25.064Z",
    "updatedAt": "2026-05-07T17:09:42.092Z"
  },
  {
    "id": "9d6dddef-1748-4fd9-970a-b16ed39e0b49",
    "title": "The Great Gatsby",
    "isbn": "9780743273565",
    "stock": 5,
    "coverImage": "/uploads/books/book-1778173165090-83252692.png",
    "authorId": "b9e7d6e0-24ae-4b09-aa9e-6c55bc037a7f",
    "categoryId": "65271525-6378-403c-beb9-2c32f9a892d2",
    "createdAt": "2026-05-04T06:56:25.064Z",
    "updatedAt": "2026-05-07T17:12:07.804Z"
  },
  {
    "id": "04fe168c-5214-4fe2-8dc8-b9c46d688b4c",
    "title": "Dune",
    "isbn": "9780441172719",
    "stock": 15,
    "coverImage": "/uploads/books/book-1778173209118-582872319.png",
    "authorId": "0683c9bf-cabe-42c3-a170-d8cdfadc19d6",
    "categoryId": "5375e0dd-886b-48e9-a8af-6eaeb25d8ca6",
    "createdAt": "2026-05-04T06:56:25.064Z",
    "updatedAt": "2026-05-08T08:33:00.504Z"
  },
  {
    "id": "eb91e03f-3d1c-47d3-bf9f-e38236bf3601",
    "title": "Test Book",
    "isbn": "1234567890123",
    "stock": 0,
    "coverImage": null,
    "authorId": null,
    "categoryId": null,
    "createdAt": "2026-05-09T17:36:39.991Z",
    "updatedAt": "2026-05-09T17:36:39.991Z"
  },
  {
    "id": "9f01988b-9832-4ef8-b9b5-f24b4fd570bd",
    "title": "Debug Book",
    "isbn": "9876543210987",
    "stock": 0,
    "coverImage": null,
    "authorId": null,
    "categoryId": null,
    "createdAt": "2026-05-09T17:38:58.342Z",
    "updatedAt": "2026-05-09T17:38:58.342Z"
  }
];
    for (const b of books) {
      await Book.create(b);
    }
    console.log('Books seeded:', books.length);

    // ── Borrowings ──
    const borrowings = [
  {
    "id": "913d73e0-f428-4ad2-aa1e-c399a4252ed3",
    "userId": "ef5b8bcf-a689-434b-916d-12ce40e01df4",
    "bookId": "9d6dddef-1748-4fd9-970a-b16ed39e0b49",
    "status": "returned",
    "borrowDate": "2026-05-06T04:35:27.984Z",
    "dueDate": "2026-05-20T04:35:27.983Z",
    "returnDate": "2026-05-06T04:47:59.650Z",
    "createdAt": "2026-05-06T04:35:27.986Z",
    "updatedAt": "2026-05-06T04:47:59.652Z"
  },
  {
    "id": "373b7c1d-61e2-4e4f-8eab-312ab73b3ef0",
    "userId": "ef5b8bcf-a689-434b-916d-12ce40e01df4",
    "bookId": "4289d99a-28ed-4bdd-9be8-f292cf2b07ce",
    "status": "returned",
    "borrowDate": "2026-05-06T16:57:08.267Z",
    "dueDate": "2026-05-20T16:57:08.267Z",
    "returnDate": "2026-05-07T09:20:45.169Z",
    "createdAt": "2026-05-06T16:57:08.269Z",
    "updatedAt": "2026-05-07T09:20:45.180Z"
  },
  {
    "id": "c3d6d84a-4e3c-48ec-ad51-0b0c4f0820aa",
    "userId": "ef5b8bcf-a689-434b-916d-12ce40e01df4",
    "bookId": "4289d99a-28ed-4bdd-9be8-f292cf2b07ce",
    "status": "returned",
    "borrowDate": "2026-05-07T10:46:00.314Z",
    "dueDate": "2026-05-21T10:46:00.311Z",
    "returnDate": "2026-05-07T17:09:42.087Z",
    "createdAt": "2026-05-07T10:46:00.320Z",
    "updatedAt": "2026-05-07T17:09:42.087Z"
  },
  {
    "id": "94d2ce40-c8a6-4798-8d44-501b63164a07",
    "userId": "ef5b8bcf-a689-434b-916d-12ce40e01df4",
    "bookId": "04fe168c-5214-4fe2-8dc8-b9c46d688b4c",
    "status": "returned",
    "borrowDate": "2026-05-08T04:42:44.796Z",
    "dueDate": "2026-05-22T04:42:44.794Z",
    "returnDate": "2026-05-08T08:33:00.467Z",
    "createdAt": "2026-05-08T04:42:44.801Z",
    "updatedAt": "2026-05-08T08:33:00.473Z"
  }
];
    for (const br of borrowings) {
      await Borrowing.create(br);
    }
    console.log('Borrowings seeded:', borrowings.length);

    // ── Payments ──
    const payments = [
  {
    "id": "008353ba-625b-4b15-a13c-4f65deb73325",
    "userId": "9716fb9a-5aa8-4257-8f92-f62e84b9a73f",
    "amount": 500,
    "status": "completed",
    "razorpayOrderId": "order_mock_mnv7lnm0k",
    "razorpayPaymentId": "pay_mock_test123",
    "invoiceNumber": "INV-1778347984443",
    "createdAt": "2026-05-09T17:33:04.444Z",
    "updatedAt": "2026-05-09T17:33:04.472Z"
  },
  {
    "id": "0df24e07-6d8d-47a4-987b-397f4a35c27c",
    "userId": "e4ba7ce5-a569-43a9-93ff-5214775b068f",
    "amount": 500,
    "status": "completed",
    "razorpayOrderId": "order_mock_x89b06ogj",
    "razorpayPaymentId": "pay_mock_test123",
    "invoiceNumber": "INV-1778348006702",
    "createdAt": "2026-05-09T17:33:26.703Z",
    "updatedAt": "2026-05-09T17:33:26.724Z"
  },
  {
    "id": "ecde0c2a-b181-4d4e-9da0-b51c43678d31",
    "userId": "d80a65ae-abc1-413c-b2f3-67a7494e8e18",
    "amount": 500,
    "status": "completed",
    "razorpayOrderId": "order_mock_cdzolv00e",
    "razorpayPaymentId": "pay_mock_test",
    "invoiceNumber": "INV-1778348200100",
    "createdAt": "2026-05-09T17:36:40.101Z",
    "updatedAt": "2026-05-09T17:36:40.119Z"
  },
  {
    "id": "53f31bf6-8694-4f95-95a8-b9ed45163999",
    "userId": "d80a65ae-abc1-413c-b2f3-67a7494e8e18",
    "amount": 500,
    "status": "completed",
    "razorpayOrderId": "order_mock_xn2u22gui",
    "razorpayPaymentId": "pay_mock_test",
    "invoiceNumber": "INV-1778348242946",
    "createdAt": "2026-05-09T17:37:22.946Z",
    "updatedAt": "2026-05-09T17:37:22.965Z"
  },
  {
    "id": "6ed3fd01-4699-43c2-a04e-7a8f413b7dce",
    "userId": "031b4374-0ac9-4ea7-8078-f93b1953da78",
    "amount": 500,
    "status": "completed",
    "razorpayOrderId": "order_mock_tu7f6b2l0",
    "razorpayPaymentId": "pay_mock_test_final",
    "invoiceNumber": "INV-1778348983763",
    "createdAt": "2026-05-09T17:49:43.763Z",
    "updatedAt": "2026-05-09T17:49:43.791Z"
  }
];
    for (const p of payments) {
      await Payment.create(p);
    }
    console.log('Payments seeded:', payments.length);

    console.log('\n✅ Database seeded successfully!');
    console.log('Admin login: admin@admin.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
