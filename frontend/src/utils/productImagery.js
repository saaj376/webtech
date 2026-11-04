// Presentation-only imagery; these are not new Product schema fields.
const images = [
  [/hoodie|coat|jacket/i, "tshirt"],
  [/tee|t-shirt|shirt|dress|scarf/i, "tshirt"],
  [/tote|bag|belt/i, "backpack"],
];
export function productImage(productName, category) {
  const entry = images.find(([pattern]) => pattern.test(productName));
  const fallback = {
    tops: "tshirt",
    bottoms: "tshirt",
    outerwear: "tshirt",
    accessories: "backpack",
  };
  const image = entry?.[1] || fallback[category?.toLowerCase()];
  return image ? `/images/${image}.jpg` : undefined;
}
