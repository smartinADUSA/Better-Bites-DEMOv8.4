"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");


  const [proteinFilter, setProteinFilter] = useState(false);
  const [fiberFilter, setFiberFilter] = useState(false);
  const [beverageFilter, setBeverageFilter] = useState(false); 
  const [guidingStarsFilter, setGuidingStarsFilter] =
  useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState("");
  async function search(value: string) {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/search?q=" + encodeURIComponent(value)
      );

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function getHydrationScore(item: any) {
    let score = 0;

    const category = (item.category || "").toLowerCase();
    const name = (item.name || "").toLowerCase();

    if (
      category.includes("produce") ||
      category.includes("fruit") ||
      category.includes("vegetable")
    ) {
      score += 10;
    }

    if (category.includes("beverage")) {
      score += 20;
    }

    if (
      name.includes("water") ||
      name.includes("juice") ||
      name.includes("tea") ||
      name.includes("lemonade") ||
      name.includes("broth") ||
      name.includes("soup")
    ) {
      score += 20;
    }

    if ((item.calories || 0) <= 60) {
      score += 10;
    }

    return Math.min(score, 20);
  }

  function getGLP1Score(item: any) {
    
    let score = 0;

    if ((item.protein || 0) >= 10) score += 40;
    if ((item.fiber || 0) >= 6) score += 40;

    score += getHydrationScore(item);

    return score;
  }
  function getGuidingStarIcon(stars: number) {
    if (stars === 1) {
      return "/guiding-star-1.webp";
    }
  
    if (stars === 2) {
      return "/guiding-star-2.webp";
    }
  
    if (stars === 3) {
      return "/guiding-star-3.webp";
    }
  
    return null;
  }

  function getTagCount(item: any) {
    let count = 0;
  
    if ((item.protein || 0) >= 10) count++;
  
    if ((item.fiber || 0) >= 6) count++;
  
    if ((item.guidingStars || 0) > 0) count++;
  
    if (getGLP1Score(item) >= 60) count++;
  
    return count;
  }
  
  function addToCart(item: any) {
    setCartMessage(`${item.name} added to cart`);

setTimeout(() => {
  setCartMessage("");
}, 2000);
    setCart((prev) => {
      const existing = prev.find(
        (cartItem) => cartItem.id === item.id
      );
  
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }
  
      return [
        ...prev,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  }
  
  function updateQuantity(
    id: string,
    amount: number
  ) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }
  
  function removeFromCart(id: string) {
    setCart((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  
  
  const filteredResults = Array.isArray(results)
  ? results
      .filter((item) => {
        // Remove corrupted records

        if (!item.name || item.name.length < 3) {
          return false;
        }

        if ((item.fiber || 0) > 100) {
          return false;
        }

        if ((item.protein || 0) > 100) {
          return false;
        }

        if (
          String(item.brand || "").startsWith('"')
        ) {
          return false;
        }

        const isGLP1 =
          filter !== "glp1" ||
          getGLP1Score(item) >= 60;

        const isProtein =
          !proteinFilter ||
          (item.protein || 0) >= 10;

        const isFiber =
          !fiberFilter ||
          (item.fiber || 0) >= 6;

          const isBeverage =
          !beverageFilter ||
          String(item.category || "")
            .toLowerCase()
            .includes("beverage");
            
            const hasGuidingStars =
            !guidingStarsFilter ||
            (item.guidingStars || 0) > 0;
            return (
              isGLP1 &&
              isProtein &&
              isFiber &&
              isBeverage &&
              hasGuidingStars
            );
            
      })
      .sort((a, b) => {
        const tagDiff =
          getTagCount(b) - getTagCount(a);
      
        if (tagDiff !== 0) {
          return tagDiff;
        }
      
        return (
          getGLP1Score(b) -
          getGLP1Score(a)
        );
      })
: [];
  return (
    <main
      style={{
        background: "#f5f8f5",
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        color: "#222",
      }}
    >
{cartMessage && (
  <div className="cart-toast">
    ✅ {cartMessage}
  </div>
)}
      
<div
  className="cart-container"
  onClick={() => setCartOpen(!cartOpen)}
>
  🛒 Cart-

  <span className="cart-count">
    {cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    )}
  </span>

  {cartOpen && (
  <div
  className="cart-dropdown"
  onClick={(e) => e.stopPropagation()}
>
    <h4>Shopping Cart</h4>

    {cart.length === 0 && (
      <p>No items added.</p>
    )}

    {cart.map((item) => (
      <div
        key={item.id}
        style={{
          borderBottom: "1px solid #eee",
          marginBottom: "10px",
          paddingBottom: "10px",
        }}
      >
        <strong>{item.name}</strong>

        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
            marginTop: "6px",
          }}
        >
          <button
            onClick={() =>
              updateQuantity(item.id, -1)
            }
          >
            -
          </button>

          <span>{item.quantity}</span>

          <button
            onClick={() =>
              updateQuantity(item.id, 1)
            }
          >
            +
          </button>

          <button
            onClick={() =>
              removeFromCart(item.id)
            }
          >
            Remove
          </button>
        </div>
      </div>
    ))}
  </div>
)}

</div>

    {/* HEADER */}

      
    <style jsx global>{`
  :root {
    color-scheme: light;
  }

  html,
  body {
    background: #f5f8f5;
    color: #222;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes fadeToast {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }

    10% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    80% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }

  .cart-toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);

    background: #138a36;
    color: white;

    padding: 12px 20px;

    border-radius: 12px;

    font-weight: bold;

    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);

    z-index: 5000;

    animation: fadeToast 2s ease forwards;
  }

  .cart-container {
    position: fixed;
    top: 20px;
    right: 20px;

    background: white;

    padding: 12px 16px;

    border-radius: 12px;

    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    cursor: pointer;

    z-index: 2000;
  }

  .cart-count {
    background: #138a36;
    color: white;

    border-radius: 50%;

    padding: 2px 8px;

    margin-left: 6px;

    font-size: 12px;

    font-weight: bold;
  }

  .cart-dropdown {
    position: absolute;

    right: 0;
    top: 50px;

    width: 350px;

    background: white;
    color: #222;

    border-radius: 12px;

    padding: 16px;

    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);

    max-height: 400px;

    overflow-y: auto;
  }

  .icon-tooltip {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
  }

  .tooltip-content {
    visibility: hidden;
    opacity: 0;

    transition: opacity 0.2s ease;

    position: absolute;

    top: 70px;
    left: 0;

    width: 260px;
    max-width: min(260px, 80vw);

    background: white;
    color: #333;

    border-radius: 12px;

    padding: 12px;

    border: 1px solid #e5e5e5;

    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);

    z-index: 9999;

    text-align: left;
  }

  .icon-tooltip:hover .tooltip-content {
    visibility: visible;
    opacity: 1;
  }
`}</style>

      {/* HEADER */}

      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 2px 10px rgba(0,0,0,.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <img
            src="/better-bites-logo.png"
            alt="Better Bites"
            style={{ height: "80px" }}
          />

          <img
            src="/stop-shop-logo.png"
            alt="Stop & Shop"
            style={{ height: "55px" }}
          />
        </div>

        <h1
          style={{
            color: "#138a36",
            marginTop: "20px",
            marginBottom: "6px",
          }}
        >
          Better Bites
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: "18px",
            marginBottom: "12px",
          }}
        >
          Nourishment that meets your goals.
        </p>

        <div
          style={{
            display: "inline-block",
            background: "#e8f7ea",
            color: "#138a36",
            padding: "8px 12px",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          Stop & Shop Wellness Pilot
        </div>
      </div>

      {/* SEARCH */}

      <div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    maxWidth: "750px",
  }}
>
  <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        search(query);
      }
    }}
    placeholder="Search foods..."
    style={{
      flex: 1,
      padding: "14px",
      borderRadius: "12px",
      border: "1px solid #ccc",
      fontSize: "16px",
    }}
  />

  <button
    onClick={() => {
      if (query.trim()) {
        search(query);
      }
    }}
    style={{
      background: "#138a36",
      color: "white",
      border: "none",
      padding: "14px 20px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Search
  </button>
</div>

      {/* FILTERS */}

      <div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "24px",
  }}
>
  <button
    onClick={() => setFilter("all")}
    style={{
      ...buttonStyle,
      backgroundColor:
        filter === "all"
          ? "#138a36"
          : "#cccccc",
    }}
  >
    All Products
  </button>

  <button
    onClick={() => setFilter("glp1")}
    style={{
      ...buttonStyle,
      backgroundColor:
        filter === "glp1"
          ? "#138a36"
          : "#cccccc",
    }}
  >
    GLP-1 Friendly
  </button>

  <button
    onClick={() =>
      setProteinFilter(!proteinFilter)
    }
    style={{
      ...buttonStyle,
      backgroundColor:
        proteinFilter
          ? "#138a36"
          : "#cccccc",
    }}
  >
    💪 High Protein
  </button>

  <button
    onClick={() =>
      setFiberFilter(!fiberFilter)
    }
    style={{
      ...buttonStyle,
      backgroundColor:
        fiberFilter
          ? "#138a36"
          : "#cccccc",
    }}
  >
    🌾 High Fiber
  </button>

  <button
  onClick={() =>
    setGuidingStarsFilter(
      !guidingStarsFilter
    )
  }
  style={{
    ...buttonStyle,
    backgroundColor:
      guidingStarsFilter
        ? "#138a36"
        : "#cccccc",
  }}
>
  ⭐ Guiding Stars
</button>

  <button
    onClick={() =>
      setBeverageFilter(
        !beverageFilter
      )
    }
    style={{
      ...buttonStyle,
      backgroundColor:
        beverageFilter
          ? "#138a36"
          : "#cccccc",
    }}
  >
    🥤 Beverages
  </button>
</div>
    

<p
  style={{
    fontWeight: "bold",
    color: "#666",
    marginBottom: "16px",
  }}
>
  Showing {filteredResults.length} products
</p>

      {/* LOADING */}

      {loading && (
        <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "12px",
          marginBottom: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
          <div style={spinnerStyle}></div>
        </div>
      )}

      {/* RESULTS */}

      {!loading &&
        filteredResults.map((item) => (
          <div
            key={item.id}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "16px",
              boxShadow: "0 2px 10px rgba(0,0,0,.08)",
            }}
          >
            <h3>{item.name}</h3>
            <button
  onClick={() => addToCart(item)}
  style={{
    background: "#138a36",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "12px",
    fontWeight: "bold",
  }}
>
  Add To Cart
</button>
            <p>
            <strong>Brand:</strong>{" "}
{String(item.brand || "")
  .replace(/^\d+:/, "")
  .replace(/"/g, "")}
            </p>

            <p>
            <strong>Category:</strong>{" "}
{String(item.category || "")
  .replace(/"/g, "")
  .trim()}
            </p>

            <div
  style={{
    display: "inline-flex",
    gap: "14px",
    alignItems: "center",
    marginTop: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  }}
>
              {(item.protein || 0) >= 10 && (
                <div
                className="icon-tooltip"
                onClick={() =>
                  setActiveTooltip(
                    activeTooltip === `protein-${item.id}`
                      ? null
                      : `protein-${item.id}`
                  )
                }
              >
                  <img
                    src="/protein-icon.png"
                    alt="Protein"
                    style={{
                      width: "48px",
                      height: "48px",
                      cursor: "pointer",
                    }}
                  />

<div
  className="tooltip-content"
  style={{
    visibility:
      activeTooltip === `protein-${item.id}`
        ? "visible"
        : "hidden",
    opacity:
      activeTooltip === `protein-${item.id}`
        ? 1
        : 0,
  }}
>
                    <strong>Protein</strong>
                    <br />
                    Provides at least 20% Daily Value of
                    protein (10g or more per serving).
                  </div>
                </div>
              )}

              {(item.fiber || 0) >= 6 && (
                <div
                className="icon-tooltip"
                onClick={() =>
                  setActiveTooltip(
                    activeTooltip === `fiber-${item.id}`
                      ? null
                      : `fiber-${item.id}`
                  )
                }
              >
                  <img
                    src="/fiber-icon.png"
                    alt="Fiber"
                    style={{
                      width: "48px",
                      height: "48px",
                      cursor: "pointer",
                    }}
                  />

<div
  className="tooltip-content"
  style={{
    visibility:
  activeTooltip === `fiber-${item.id}`
    ? "visible"
    : "hidden",

opacity:
  activeTooltip === `fiber-${item.id}`
    ? 1
    : 0,
  }}
>
                    <strong>Fiber</strong>
                    <br />
                    Provides at least 20% Daily Value of
                    fiber (6g or more per serving).
                  </div>
                </div>
              )}

              {getHydrationScore(item) >= 10 && (
                <div
                className="icon-tooltip"
                onClick={() =>
                  setActiveTooltip(
                    activeTooltip === `hydration-${item.id}`
                      ? null
                      : `hydration-${item.id}`
                  )
                }
              >
                  <img
                    src="/hydration-icon.png"
                    alt="Hydration"
                    style={{
                      width: "48px",
                      height: "48px",
                      cursor: "pointer",
                    }}
                  />

<div
  className="tooltip-content"
  style={{
    visibility:
  activeTooltip === `hydration-${item.id}`
    ? "visible"
    : "hidden",

opacity:
  activeTooltip === `hydration-${item.id}`
    ? 1
    : 0,
  }}
>
                    <strong>Hydration</strong>
                    <br />
                    Supports hydration based on food type
                    and nutritional profile.
                  </div>
                </div>
              )}
              {(item.guidingStars || 0) > 0 && (
  <div
    className="icon-tooltip"
    onClick={() =>
      setActiveTooltip(
        activeTooltip === `stars-${item.id}`
          ? null
          : `stars-${item.id}`
      )
    }
  >
    <img
      src={getGuidingStarIcon(item.guidingStars) || ""}
      alt={`${item.guidingStars} Guiding Stars`}
      style={{
        width: "48px",
        height: "48px",
        cursor: "pointer",
      }}
    />

    <div
      className="tooltip-content"
      style={{
        visibility:
          activeTooltip === `stars-${item.id}`
            ? "visible"
            : "hidden",
        opacity:
          activeTooltip === `stars-${item.id}`
            ? 1
            : 0,
      }}
    >
      <strong>
        {item.guidingStars} Guiding Star
        {item.guidingStars > 1 ? "s" : ""}
      </strong>

      <br />

      Awarded based on overall nutritional quality.
    </div>
  </div>
)}

            </div>
           
            {getGLP1Score(item) >= 60 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    background: "#16a34a",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                  }}
                >
                  ✅ GLP-1 Friendly
                </div>

                <button
                  onClick={() => setSelectedProduct(item)}
                  style={{
                    border: "1px solid #138a36",
                    background: "white",
                    color: "#138a36",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Why This Is GLP-1 Friendly
                </button>
              </div>
            )}

            <div
              style={{
                color: "#666",
                marginTop: "10px",
              }}
            >
              Calories: {item.calories} • Protein: {item.protein}g • Fiber:{" "}
              {item.fiber}g • Sugar: {item.sugar}g
            </div>
          </div>
        ))}

      {/* MODAL */}

      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 10px 30px rgba(0,0,0,.25)",
            }}
          >
            <h2
              style={{
                color: "#138a36",
                marginTop: 0,
              }}
            >
              Why This Is GLP-1 Friendly
            </h2>

            <p>
              Better Bites highlights foods that support protein intake and
              fiber intake. 
            </p>
            {(selectedProduct.guidingStars || 0) > 0 && (
  <p>
    ⭐ <strong>Guiding Stars:</strong>{" "}
    This product has earned
    {" "}{selectedProduct.guidingStars}
    {" "}Guiding Star
    {selectedProduct.guidingStars > 1
      ? "s"
      : ""}
    based on its nutritional quality.
  </p>
)}

            {(selectedProduct.protein || 0) >= 10 && (
              <p>
                💪 <strong>Protein:</strong> Provides at least 10g of
                protein per serving (20% Daily Value or more).
              </p>
            )}

            {(selectedProduct.fiber || 0) >= 6 && (
              <p>
                🌾 <strong>Fiber:</strong> Provides at least 6g of fiber
                per serving (20% Daily Value or more).
              </p>
            )}

            {getHydrationScore(selectedProduct) >= 10 && (
              <p>
                💧 <strong>Hydration:</strong> Product characteristics
                indicate hydration support.
              </p>
            )}

            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                background: "#138a36",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "10px",
                fontWeight: "bold",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

const buttonStyle = {
  backgroundColor: "#138a36",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "4px solid #d9d9d9",
  borderTop: "4px solid #138a36",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};