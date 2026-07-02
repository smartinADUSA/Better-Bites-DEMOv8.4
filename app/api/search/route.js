import products from "../../data/products.json";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const query =
    searchParams.get("q")?.toLowerCase().trim() || "";

  if (!query) {
    return Response.json([]);
  }

  const filtered = products.filter((product) => {
    const text = `
      ${product.name || ""}
      ${product.brand || ""}
      ${product.category || ""}
      ${product.subCategory || ""}
    `.toLowerCase();

    return text.includes(query);
  });

  return Response.json(
    filtered.slice(0, 50)
  );
}