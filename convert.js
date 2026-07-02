const fs = require('fs');

const csv = fs.readFileSync('Porducts.DEMOv1.csv', 'utf8');

const lines = csv.split('\n').filter(Boolean);

const headers = lines[1].split(',');

console.log(headers);

const getIndex = (name) => headers.indexOf(name);

const idx = {
  id: getIndex('product_id'),
  brand: getIndex('brand_text'),
  category: getIndex('root_cat_name'),
  subCategory: getIndex('sub_category'),
  gluten: getIndex('gluten_flag'),
  vegan: getIndex('vegan_flag'),
  name: getIndex('item_long_name'),
  calories: getIndex('total_calories'),
  sodium: getIndex('sodium'),
  fiber: getIndex('dietary_fiber'),
  sugar: getIndex('sugar'),
  protein: getIndex('protein'),
  stars: getIndex('guiding_stars'),
  image: getIndex('primary_image'),
  sustainability: getIndex('sustainability_rating')
};

const products = [];
const seen = new Set();

for (let i = 2; i < lines.length; i++) {
  const row = lines[i].split(',');

  const id = row[idx.id];

  if (!id || seen.has(id)) continue;

  seen.add(id);

  products.push({
    id,
    name: row[idx.name] || '',
    brand: row[idx.brand] || '',
    category: row[idx.category] || '',
    subCategory: row[idx.subCategory] || '',
    calories: Number(row[idx.calories]) || 0,
    protein: Number(row[idx.protein]) || 0,
    fiber: Number(row[idx.fiber]) || 0,
    sodium: Number(row[idx.sodium]) || 0,
    sugar: Number(row[idx.sugar]) || 0,
    vegan: row[idx.vegan] === 'Y',
    glutenFree: row[idx.gluten] === 'Y',
    guidingStars: Number(row[idx.stars]) || 0,
    sustainability: Number(row[idx.sustainability]) || 0,
    image: row[idx.image] || ''
  });
}

fs.writeFileSync(
  'products.json',
  JSON.stringify(products, null, 2)
);

console.log(`Created ${products.length} products`);
