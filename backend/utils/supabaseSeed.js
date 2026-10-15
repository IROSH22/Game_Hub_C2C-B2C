const bcrypt = require('bcryptjs');
const { getSupabase, isSupabaseLive } = require('./supabaseClient');

const seedSupabaseData = async () => {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseLive()) {
    console.warn('⚠️ Supabase credentials not configured. Skipping Supabase seed.');
    return;
  }

  try {
    console.log('⚡ Checking and synchronizing Supabase Cloud Database...');

    // 1. Prepare valid bcrypt hash for 'password123'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 2. Seed / Update Demo Users
    const demoUsers = [
      {
        id: 'a1111111-1111-1111-1111-111111111111',
        name: 'Alex Mercer (Gamer)',
        email: 'gamer@gamehub.com',
        password: hashedPassword,
        role: 'customer',
        phone: '+94 77 123 4567',
        address: '12 Kandy Road, Malabe',
        city: 'Colombo',
        profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        shop_name: '',
        trust_score: 96,
        successful_trades: 18,
        wishlist: [],
      },
      {
        id: 'a2222222-2222-2222-2222-222222222222',
        name: 'Elena Rostova (Trader)',
        email: 'gamer2@gamehub.com',
        password: hashedPassword,
        role: 'customer',
        phone: '+94 75 444 8899',
        address: '88 Lake Drive, Rajagiriya',
        city: 'Colombo',
        profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        shop_name: '',
        trust_score: 92,
        successful_trades: 12,
        wishlist: [],
      },
      {
        id: 'a3333333-3333-3333-3333-333333333333',
        name: 'Nexus Gaming Official',
        email: 'seller@gamehub.com',
        password: hashedPassword,
        role: 'seller',
        phone: '+94 71 987 6543',
        address: '45 Tech Plaza, Galle Road',
        city: 'Colombo',
        profile_image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200',
        shop_name: 'Nexus Gaming Superstore',
        trust_score: 99,
        successful_trades: 142,
        wishlist: [],
      },
      {
        id: 'a4444444-4444-4444-4444-444444444444',
        name: 'GameHub System Admin',
        email: 'admin@gamehub.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+94 77 123 4567',
        address: '100 Cyber Tower, Horizon Avenue',
        city: 'Colombo',
        profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        shop_name: '',
        trust_score: 100,
        successful_trades: 500,
        wishlist: [],
      },
    ];

    for (const u of demoUsers) {
      const { data: existing } = await supabase.from('users').select('id').eq('email', u.email).maybeSingle();
      if (existing) {
        await supabase.from('users').update({
          name: u.name,
          password: u.password,
          role: u.role,
          phone: u.phone,
          address: u.address,
          city: u.city,
          profile_image: u.profile_image,
          shop_name: u.shop_name,
          trust_score: u.trust_score,
          successful_trades: u.successful_trades,
        }).eq('id', existing.id);
      } else {
        await supabase.from('users').insert(u);
      }
    }
    console.log('✅ Supabase Demo Users synchronized.');

    // 3. Seed / Update Game Listings
    const sellerId = 'a3333333-3333-3333-3333-333333333333';
    const gamer1Id = 'a1111111-1111-1111-1111-111111111111';
    const gamer2Id = 'a2222222-2222-2222-2222-222222222222';

    const fullGames = [
      {
        seller_id: sellerId,
        title: 'Grand Theft Auto VI',
        platform: 'PS5',
        genre: 'Open World',
        condition: 'Brand New',
        price: 69.99,
        stock: 25,
        exchangeable: false,
        looking_for: '',
        image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
        status: 'Active',
        city: 'Colombo',
        rating: 4.9,
      },
      {
        seller_id: sellerId,
        title: 'EA Sports FC 25',
        platform: 'PS5',
        genre: 'Sports',
        condition: 'Brand New',
        price: 59.99,
        stock: 30,
        exchangeable: false,
        looking_for: '',
        image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
        status: 'Active',
        city: 'Colombo',
        rating: 4.7,
      },
      {
        seller_id: sellerId,
        title: "Marvel's Spider-Man 2",
        platform: 'PS5',
        genre: 'Action',
        condition: 'Brand New',
        price: 59.99,
        stock: 18,
        exchangeable: false,
        looking_for: '',
        image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800',
        status: 'Active',
        city: 'Colombo',
        rating: 4.9,
      },
      {
        seller_id: gamer1Id,
        title: 'God of War Ragnarök',
        platform: 'PS5',
        genre: 'Action',
        condition: 'Like New',
        price: 0.00,
        stock: 1,
        exchangeable: true,
        looking_for: 'Elden Ring or Black Myth: Wukong',
        image_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
        status: 'Active',
        city: 'Colombo',
        rating: 5.0,
      },
      {
        seller_id: gamer2Id,
        title: 'Elden Ring: Shadow of the Erdtree',
        platform: 'PS5',
        genre: 'RPG',
        condition: 'Like New',
        price: 0.00,
        stock: 1,
        exchangeable: true,
        looking_for: 'God of War Ragnarok or Cyberpunk 2077',
        image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
        status: 'Active',
        city: 'Colombo',
        rating: 4.9,
      },
      {
        seller_id: gamer1Id,
        title: 'Cyberpunk 2077: Ultimate Edition',
        platform: 'Xbox Series X',
        genre: 'Open World',
        condition: 'Good',
        price: 0.00,
        stock: 1,
        exchangeable: true,
        looking_for: 'Hogwarts Legacy or Forza Horizon 5',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        status: 'Active',
        city: 'Colombo',
        rating: 4.8,
      },
      {
        seller_id: sellerId,
        title: 'Black Myth: Wukong',
        platform: 'PC',
        genre: 'Action',
        condition: 'Brand New',
        price: 54.99,
        stock: 40,
        exchangeable: false,
        looking_for: '',
        image_url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800',
        status: 'Active',
        city: 'Colombo',
        rating: 5.0,
      },
      {
        seller_id: gamer2Id,
        title: 'The Legend of Zelda: Tears of the Kingdom',
        platform: 'Nintendo Switch',
        genre: 'Adventure',
        condition: 'Like New',
        price: 0.00,
        stock: 1,
        exchangeable: true,
        looking_for: 'Super Mario Odyssey or Xenoblade 3',
        image_url: 'https://images.unsplash.com/photo-1578377375762-d5540f32e9cf?w=800',
        status: 'Active',
        city: 'Kandy',
        rating: 4.9,
      },
      {
        seller_id: sellerId,
        title: 'Forza Horizon 5',
        platform: 'Xbox Series X',
        genre: 'Racing',
        condition: 'Brand New',
        price: 49.99,
        stock: 15,
        exchangeable: false,
        looking_for: '',
        image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
        status: 'Active',
        city: 'Colombo',
        rating: 4.7,
      },
      {
        seller_id: gamer1Id,
        title: 'Final Fantasy XVI',
        platform: 'PS5',
        genre: 'RPG',
        condition: 'Like New',
        price: 0.00,
        stock: 1,
        exchangeable: true,
        looking_for: 'Tekken 8 or Resident Evil 4',
        image_url: 'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=800',
        status: 'Active',
        city: 'Malabe',
        rating: 4.8,
      },
      {
        seller_id: gamer2Id,
        title: "Ghost of Tsushima: Director's Cut",
        platform: 'PS5',
        genre: 'Action',
        condition: 'Good',
        price: 0.00,
        stock: 1,
        exchangeable: true,
        looking_for: 'Bloodborne or Sekiro',
        image_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800',
        status: 'Active',
        city: 'Colombo',
        rating: 4.9,
      },
    ];

    for (const g of fullGames) {
      const { data: existing } = await supabase.from('game_listings').select('id').eq('title', g.title).limit(1);
      if (existing && existing.length > 0) {
        await supabase.from('game_listings').update(g).eq('id', existing[0].id);
      } else {
        await supabase.from('game_listings').insert(g);
      }
    }
    console.log('✅ Supabase Game Listings catalog synchronized.');
  } catch (err) {
    console.error('❌ Supabase seed error:', err.message);
  }
};

module.exports = seedSupabaseData;
