const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const sampleProducts = [
  {
    name: "Tailored Wool-Blend Blazer",
    category: "Outerwear",
    price: 4499,
    originalPrice: 5999,
    stock: 14,
    label: "BESTSELLER",
    description:
      "Structured single-breasted blazer crafted from a breathable wool-blend suiting fabric with peak lapels and satin lining.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Charcoal Grey", "Camel", "Black"],
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Silk-Touch Draped Midi Dress",
    category: "Women",
    price: 3299,
    originalPrice: 4199,
    stock: 18,
    label: "NEW ARRIVAL",
    description:
      "Fluid bias-cut midi dress with a subtle cowl neckline and adjustable spaghetti straps for effortless evening wear.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Champagne", "Espresso", "Midnight Black"],
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Relaxed Linen Camp-Collar Shirt",
    category: "Men",
    price: 2199,
    originalPrice: 2799,
    stock: 22,
    label: "NEW ARRIVAL",
    description:
      "100% European flax linen shirt cut in a relaxed silhouette with mother-of-pearl buttons.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Ivory", "Olive", "Navy"],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "High-Waist Pleated Wide Trousers",
    category: "Women",
    price: 2699,
    originalPrice: 3299,
    stock: 15,
    label: "ESSENTIAL",
    description:
      "Full-length tailored trousers featuring double front pleats, side slant pockets, and a clean concealed hook closure.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Sand", "Black", "Taupe"],
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Double-Breasted Trench Coat",
    category: "Outerwear",
    price: 5899,
    originalPrice: 7499,
    stock: 9,
    label: "LIMITED",
    description:
      "Water-repellent cotton gabardine trench with storm flaps, belted waist, and horn-effect buttons.",
    sizes: ["S", "M", "L"],
    colors: ["Warm Beige", "Stone"],
    images: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Minimalist Leather Crossbody Tote",
    category: "Accessories",
    price: 3799,
    originalPrice: 4599,
    stock: 11,
    label: "BESTSELLER",
    description:
      "Full-grain pebbled leather tote with detachable crossbody strap, magnetic closure, and suede-lined interior pocket.",
    sizes: ["One Size"],
    colors: ["Cognac", "Black"],
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Merino Wool Crewneck Knit",
    category: "Men",
    price: 2899,
    originalPrice: 3499,
    stock: 20,
    label: "ESSENTIAL",
    description:
      "Fine-gauge 100% Australian merino wool sweater with ribbed cuffs and hem for breathable layering.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Oatmeal", "Charcoal", "Forest Green"],
    images: [
      "https://images.unsplash.com/photo-1614975059251-992f11792b9f?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Crisp Poplin Ruched Blouse",
    category: "Women",
    price: 1899,
    originalPrice: 2399,
    stock: 25,
    label: "NEW ARRIVAL",
    description:
      "Organic cotton poplin top with subtle shoulder gathering and buttoned cuffs.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Optic White", "Sky Blue"],
    images: [
      "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Structured Suede Overshirt",
    category: "Men",
    price: 4999,
    originalPrice: 6299,
    stock: 4,
    label: "LIMITED",
    description:
      "Supple faux-suede overshirt with chest patch pockets and snap closures—ideal over a crisp tee.",
    sizes: ["M", "L", "XL"],
    colors: ["Espresso", "Sandstone"],
    images: [
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Cashmere-Blend Ribbed Scarf",
    category: "Accessories",
    price: 1699,
    originalPrice: 2199,
    stock: 30,
    label: "GIFT PICK",
    description:
      "Generously proportioned ribbed scarf spun from a soft cashmere and wool blend.",
    sizes: ["One Size"],
    colors: ["Cream", "Camel", "Heather Grey"],
    images: [
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Tailored Slim Chino Trousers",
    category: "Men",
    price: 2499,
    originalPrice: 2999,
    stock: 19,
    label: "BESTSELLER",
    description:
      "Brushed stretch-cotton twill chinos tapered cleanly from knee to ankle.",
    sizes: ["30", "32", "34", "36"],
    colors: ["Khaki", "Navy", "Obsidian"],
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Sculpted Gold-Plated Hoop Earrings",
    category: "Accessories",
    price: 1299,
    originalPrice: 1599,
    stock: 24,
    label: "NEW ARRIVAL",
    description:
      "Lightweight 18k gold-vermeil hollow hoops with a secure hinge clasp.",
    sizes: ["One Size"],
    colors: ["18k Gold"],
    images: [
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Product.deleteMany({});
    const inserted = await Product.insertMany(sampleProducts);
    console.log(
      `Seeded ${inserted.length} products with images into Zélora MongoDB.`,
    );
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
