// Presentation-only imagery; these are not new Product schema fields.
const images = [
  [/headphone/i, "headphones"],
  [/mouse/i, "mouse"],
  [/shirt/i, "tshirt"],
  [/backpack|bag/i, "backpack"],
  [/watch/i, "watch"],
  [/speaker/i, "speaker"],
];
export function productImage(productName, category) {
  const entry = images.find(([pattern]) => pattern.test(productName));
  const fallback = {
    electronics: "headphones",
    fashion: "tshirt",
    accessories: "backpack",
  };
  const image = entry?.[1] || fallback[category?.toLowerCase()];
  return image ? `/images/${image}.jpg` : undefined;
}
