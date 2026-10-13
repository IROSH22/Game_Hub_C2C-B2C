const bcrypt = require('bcryptjs');
const User = require('../models/User');
const GameListing = require('../models/GameListing');
const ExchangeRequest = require('../models/ExchangeRequest');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const EmailLog = require('../models/EmailLog');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('⚡ Seeding initial Game Hub data...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Create Users
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@gamehub.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+94 77 123 4567',
      address: '100 Cyber Tower, Horizon Avenue',
      city: 'Colombo',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      trustScore: 100,
      successfulTrades: 50,
    });

    const sellerUser = await User.create({
      name: 'Nexus Gaming Store',
      email: 'seller@gamehub.com',
      password: hashedPassword,
      role: 'seller',
      shopName: 'Nexus Gaming Official Store',
      shopDescription: 'Official authorized distributor of premium console & PC video games and accessories.',
      phone: '+94 71 987 6543',
      address: '45 Tech Plaza, Galle Road',
      city: 'Colombo',
      profileImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200',
      trustScore: 99,
      successfulTrades: 120,
    });

    const customerAlex = await User.create({
      name: 'Alex Mercer (Gamer)',
      email: 'gamer@gamehub.com',
      password: hashedPassword,
      role: 'customer',
      phone: '+94 76 555 1234',
      address: '12 Kandy Road, Malabe',
      city: 'Malabe',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      trustScore: 96,
      successfulTrades: 18,
    });

    const customerSarah = await User.create({
      name: 'Sarah Connor (Trader)',
      email: 'gamer2@gamehub.com',
      password: hashedPassword,
      role: 'customer',
      phone: '+94 75 444 8899',
      address: '88 Lake Drive, Rajagiriya',
      city: 'Rajagiriya',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      trustScore: 94,
      successfulTrades: 12,
    });

    // 2. Create Game Listings
    const listingsData = [
      {
        sellerId: sellerUser._id,
        title: 'Grand Theft Auto VI',
        description: 'Next-generation open-world crime thriller set in Leonida. Features dual protagonists, unmatched graphics, and groundbreaking physics.',
        platform: 'PS5',
        genre: 'Open World',
        condition: 'Brand New',
        isNewGame: true,
        price: 69.99,
        originalPrice: 79.99,
        stock: 25,
        exchangeable: false,
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
        screenshots: [
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
        ],
        status: 'Active',
        rating: 4.9,
        reviewsCount: 38,
        isFeatured: true,
      },
      {
        sellerId: sellerUser._id,
        title: 'EA Sports FC 25',
        description: 'Football authenticity with FC IQ, HyperMotionV technology, and realistic tactical control across 700+ authentic clubs.',
        platform: 'PS5',
        genre: 'Sports',
        condition: 'Brand New',
        isNewGame: true,
        price: 59.99,
        originalPrice: 69.99,
        stock: 30,
        exchangeable: false,
        imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
        screenshots: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'],
        status: 'Active',
        rating: 4.7,
        reviewsCount: 22,
        isFeatured: true,
      },
      {
        sellerId: sellerUser._id,
        title: "Marvel's Spider-Man 2",
        description: 'Peter Parker and Miles Morales return in an epic adventure with Venom and Kraven the Hunter across an expanded New York City.',
        platform: 'PS5',
        genre: 'Action',
        condition: 'Brand New',
        isNewGame: true,
        price: 59.99,
        originalPrice: 69.99,
        stock: 18,
        exchangeable: false,
        imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
        screenshots: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'],
        status: 'Active',
        rating: 4.9,
        reviewsCount: 45,
        isFeatured: true,
      },
      {
        sellerId: customerAlex._id,
        title: 'God of War Ragnarök',
        description: 'Kratos and Atreus embark on a mythic journey for answers before the prophesied battle that will end the world. Disc in pristine condition!',
        platform: 'PS5',
        genre: 'Action',
        condition: 'Like New',
        isNewGame: false,
        price: 39.99,
        originalPrice: 69.99,
        stock: 1,
        exchangeable: true,
        wantedGames: 'Elden Ring or Black Myth: Wukong',
        imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
        screenshots: ['https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800'],
        status: 'Active',
        rating: 5.0,
        reviewsCount: 14,
        isFeatured: true,
      },
      {
        sellerId: customerSarah._id,
        title: 'Elden Ring: Shadow of the Erdtree Edition',
        description: 'Guided by Empyrean Miquella, players are beckoned to the Land of Shadow. Complete in original box with bonus art cards.',
        platform: 'PS5',
        genre: 'RPG',
        condition: 'Like New',
        isNewGame: false,
        price: 44.99,
        originalPrice: 59.99,
        stock: 1,
        exchangeable: true,
        wantedGames: 'God of War Ragnarok or Cyberpunk 2077',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
        screenshots: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'],
        status: 'Active',
        rating: 4.9,
        reviewsCount: 29,
        isFeatured: true,
      },
      {
        sellerId: customerAlex._id,
        title: 'Cyberpunk 2077: Ultimate Edition',
        description: 'Experience the full story of V in Night City, including the espionage thriller expansion Phantom Liberty. Includes map and stickers.',
        platform: 'Xbox Series X',
        genre: 'Open World',
        condition: 'Good',
        isNewGame: false,
        price: 34.99,
        originalPrice: 59.99,
        stock: 1,
        exchangeable: true,
        wantedGames: 'Hogwarts Legacy or Forza Horizon 5',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        screenshots: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'],
        status: 'Active',
        rating: 4.8,
        reviewsCount: 19,
        isFeatured: false,
      },
      {
        sellerId: sellerUser._id,
        title: 'The Legend of Zelda: Tears of the Kingdom',
        description: 'An epic adventure across the land and skies of Hyrule awaits in this sequel to The Legend of Zelda: Breath of the Wild.',
        platform: 'Nintendo Switch',
        genre: 'Adventure',
        condition: 'Brand New',
        isNewGame: true,
        price: 59.99,
        originalPrice: 69.99,
        stock: 15,
        exchangeable: false,
        imageUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80',
        screenshots: ['https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800'],
        status: 'Active',
        rating: 5.0,
        reviewsCount: 52,
        isFeatured: true,
      },
      {
        sellerId: sellerUser._id,
        title: 'Black Myth: Wukong',
        description: 'Action RPG rooted in Chinese mythology. Set out as the Destined One to venture into the challenges and marvels ahead.',
        platform: 'PC',
        genre: 'Action',
        condition: 'Brand New',
        isNewGame: true,
        price: 59.99,
        originalPrice: 69.99,
        stock: 20,
        exchangeable: false,
        imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
        screenshots: ['https://images.unsplash.com/photo-1563089145-599997674d42?w=800'],
        status: 'Active',
        rating: 4.9,
        reviewsCount: 33,
        isFeatured: true,
      },
      {
        sellerId: customerSarah._id,
        title: 'Hogwarts Legacy',
        description: 'Experience Hogwarts in the 1800s. Your character holds the key to an ancient secret that threatens to tear the wizarding world apart.',
        platform: 'PS5',
        genre: 'RPG',
        condition: 'Good',
        isNewGame: false,
        price: 35.00,
        originalPrice: 69.99,
        stock: 1,
        exchangeable: true,
        wantedGames: 'Spider-Man 2 or Resident Evil 4',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        screenshots: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'],
        status: 'Active',
        rating: 4.7,
        reviewsCount: 16,
        isFeatured: false,
      },
      {
        sellerId: sellerUser._id,
        title: 'Resident Evil 4 Remake',
        description: 'Survival is just the beginning. Agent Leon S. Kennedy is sent on a mission to rescue the president’s kidnapped daughter.',
        platform: 'PS5',
        genre: 'Horror',
        condition: 'Brand New',
        isNewGame: true,
        price: 49.99,
        originalPrice: 59.99,
        stock: 12,
        exchangeable: false,
        imageUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80',
        screenshots: ['https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800'],
        status: 'Active',
        rating: 4.8,
        reviewsCount: 28,
        isFeatured: false,
      },
      {
        sellerId: sellerUser._id,
        title: 'Forza Horizon 5',
        description: 'Lead breathtaking expeditions across the vibrant and ever-evolving open world landscapes of Mexico with limitless fun driving action.',
        platform: 'Xbox Series X',
        genre: 'Racing',
        condition: 'Brand New',
        isNewGame: true,
        price: 49.99,
        originalPrice: 59.99,
        stock: 14,
        exchangeable: false,
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
        screenshots: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'],
        status: 'Active',
        rating: 4.9,
        reviewsCount: 31,
        isFeatured: false,
      },
      {
        sellerId: sellerUser._id,
        title: 'Super Mario Bros. Wonder',
        description: 'Classic Mario side-scrolling gameplay turned on its head with the addition of Wonder Flowers. Wild, unpredictable fun!',
        platform: 'Nintendo Switch',
        genre: 'Adventure',
        condition: 'Brand New',
        isNewGame: true,
        price: 49.99,
        originalPrice: 59.99,
        stock: 22,
        exchangeable: false,
        imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800',
        screenshots: ['https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800'],
        status: 'Active',
        rating: 4.9,
        reviewsCount: 40,
        isFeatured: false,
      },
    ];

    const insertedGames = await GameListing.insertMany(listingsData);
    console.log(`✅ Seeded ${insertedGames.length} game listings.`);

    // Set Alex's wishlist to include Elden Ring
    const eldenRingGame = insertedGames.find((g) => g.title.includes('Elden Ring'));
    const gowGame = insertedGames.find((g) => g.title.includes('God of War'));
    if (eldenRingGame) {
      customerAlex.wishlist.push(eldenRingGame._id);
      await customerAlex.save();
    }

    // 3. Create Sample Exchange Request (Alex offers God of War for Sarah's Elden Ring)
    if (gowGame && eldenRingGame) {
      await ExchangeRequest.create({
        requesterId: customerAlex._id,
        receiverId: customerSarah._id,
        offeredListingId: gowGame._id,
        wantedListingId: eldenRingGame._id,
        status: 'Pending',
        message: 'Hi Sarah! I have God of War in mint condition with steelbook. Would love to trade for your Elden Ring!',
        requesterAddress: customerAlex.address,
        receiverAddress: customerSarah.address,
      });

      await Notification.create({
        userId: customerSarah._id,
        title: '🔄 New Trade Request Received',
        message: 'Alex Mercer offered "God of War Ragnarök" for your "Elden Ring: Shadow of the Erdtree"!',
        type: 'exchange_request',
        link: '/exchange-dashboard',
      });
    }

    // 4. Create Sample Order & Email Log for Alex
    const spidermanGame = insertedGames.find((g) => g.title.includes('Spider-Man'));
    if (spidermanGame) {
      const sampleOrder = await Order.create({
        buyerId: customerAlex._id,
        items: [
          {
            listingId: spidermanGame._id,
            sellerId: sellerUser._id,
            title: spidermanGame.title,
            price: spidermanGame.price,
            quantity: 1,
            platform: spidermanGame.platform,
            imageUrl: spidermanGame.imageUrl,
            condition: spidermanGame.condition,
          },
        ],
        subtotal: spidermanGame.price,
        shippingFee: 0,
        discountAmount: 0,
        totalAmount: spidermanGame.price,
        shippingAddress: {
          fullName: customerAlex.name,
          phone: customerAlex.phone,
          address: customerAlex.address,
          city: customerAlex.city,
          postalCode: '10115',
        },
        paymentMethod: 'Credit Card',
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed',
        transactionId: 'TXN-984210-DEMO',
        cardLast4: '4242',
      });

      // Sample email log
      await EmailLog.create({
        recipientEmail: customerAlex.email,
        recipientName: customerAlex.name,
        subject: `🎮 Order Receipt #${sampleOrder._id.toString().slice(-6).toUpperCase()} - Game Hub`,
        templateType: 'order_receipt',
        htmlContent: `<p>Sample confirmed order for ${spidermanGame.title} ($${spidermanGame.price}).</p>`,
        status: 'Simulated',
      });

      await Notification.create({
        userId: customerAlex._id,
        title: '📦 Order Confirmed',
        message: `Your order for ${spidermanGame.title} has been placed successfully!`,
        type: 'order_status',
        link: '/my-orders',
      });
    }

    console.log('✅ Seed completed successfully with demo accounts and games!');
  } catch (err) {
    console.error('Seed error:', err);
  }
};

module.exports = seedDatabase;
