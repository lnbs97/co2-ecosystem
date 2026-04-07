import blackTShirt from "@assets/generated_images/black_minimalist_t-shirt_product.jpg";
import blueJeans from "@assets/generated_images/blue_denim_jeans_product.jpg";
import whiteShirt from "@assets/generated_images/white_button-up_shirt_product.jpg";
import graySweater from "@assets/generated_images/gray_wool_sweater_product.jpg";
import beigeTrench from "@assets/generated_images/beige_trench_coat_product.jpg";
import blackSneakers from "@assets/generated_images/black_sneakers_product.jpg";
import floralDress from "@assets/generated_images/floral_summer_dress_product.jpg";
import navyBlazer from "@assets/generated_images/navy_blue_blazer_product.jpg";

export interface Product {
  id: string;
  name: string;
  brand: string;
  euroPrice: number;
  co2Price: number;
  image: string;
  category: string;
  sizes: string[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Essential Black T-Shirt",
    brand: "Urban Basics",
    euroPrice: 29.99,
    co2Price: 7000, // 7kg
    image: blackTShirt,
    category: "Tops",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "2",
    name: "Classic Blue Denim",
    brand: "Denim Co",
    euroPrice: 89.99,
    co2Price: 25000, // 25kg
    image: blueJeans,
    category: "Bottoms",
    sizes: ["28", "30", "32", "34", "36"],
  },
  {
    id: "3",
    name: "Premium White Shirt",
    brand: "Formal Essentials",
    euroPrice: 59.99,
    co2Price: 12000, // 12kg
    image: whiteShirt,
    category: "Tops",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "4",
    name: "Cozy Wool Sweater",
    brand: "Winter Warmth",
    euroPrice: 79.99,
    co2Price: 35000, // 35kg
    image: graySweater,
    category: "Tops",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "5",
    name: "Classic Trench Coat",
    brand: "Timeless Fashion",
    euroPrice: 189.99,
    co2Price: 55000, // 55kg
    image: beigeTrench,
    category: "Outerwear",
    sizes: ["S", "M", "L"],
  },
  {
    id: "6",
    name: "Modern Black Sneakers",
    brand: "Street Style",
    euroPrice: 119.99,
    co2Price: 20000, // 20kg
    image: blackSneakers,
    category: "Shoes",
    sizes: ["38", "39", "40", "41", "42", "43"],
  },
  {
    id: "7",
    name: "Floral Summer Dress",
    brand: "Bloom Collection",
    euroPrice: 69.99,
    co2Price: 15000, // 15kg
    image: floralDress,
    category: "Dresses",
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "8",
    name: "Navy Blue Blazer",
    brand: "Professional Line",
    euroPrice: 149.99,
    co2Price: 65000, // 65kg
    image: navyBlazer,
    category: "Outerwear",
    sizes: ["S", "M", "L", "XL"],
  },
];