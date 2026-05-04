const { sequelize, Author, Category, Book } = require('../models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); 
    console.log('Database synced (all tables cleared)');


    const categories = await Category.bulkCreate([
      { name: 'Classic', description: 'Timeless literature' },
      { name: 'Science Fiction', description: 'Futuristic and space adventures' },
      { name: 'Fantasy', description: 'Magic and mythical creatures' },
      { name: 'Dystopian', description: 'Social and political structures in a dark future' },
      { name: 'Mystery', description: 'Suspense and crime solving' }
    ]);
    console.log('Categories seeded');


    const authors = await Author.bulkCreate([
      { name: 'F. Scott Fitzgerald', biography: 'Famous American novelist of the Jazz Age.' },
      { name: 'George Orwell', biography: 'English novelist, essayist, journalist and critic.' },
      { name: 'J.R.R. Tolkien', biography: 'English writer, poet, philologist, and academic.' },
      { name: 'Harper Lee', biography: 'American novelist known for To Kill a Mockingbird.' },
      { name: 'Frank Herbert', biography: 'American science fiction novelist, best known for Dune.' }
    ]);
    console.log('Authors seeded');


    await Book.bulkCreate([
      { 
        title: 'The Great Gatsby', 
        isbn: '9780743273565', 
        publicationYear: 1925, 
        stock: 5, 
        availableStock: 5,
        authorId: authors[0].id, 
        categoryId: categories[0].id 
      },
      { 
        title: '1984', 
        isbn: '9780451524935', 
        publicationYear: 1949, 
        stock: 10, 
        availableStock: 10,
        authorId: authors[1].id, 
        categoryId: categories[3].id 
      },
      { 
        title: 'The Hobbit', 
        isbn: '9780547928227', 
        publicationYear: 1937, 
        stock: 8, 
        availableStock: 8,
        authorId: authors[2].id, 
        categoryId: categories[2].id 
      },
      { 
        title: 'To Kill a Mockingbird', 
        isbn: '9780061120084', 
        publicationYear: 1960, 
        stock: 12, 
        availableStock: 12,
        authorId: authors[3].id, 
        categoryId: categories[0].id 
      },
      { 
        title: 'Dune', 
        isbn: '9780441172719', 
        publicationYear: 1965, 
        stock: 15, 
        availableStock: 15,
        authorId: authors[4].id, 
        categoryId: categories[1].id 
      }
    ]);
    console.log('Books seeded');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
