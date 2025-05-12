"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import gameSessionManager from "@/utils/GameSessionManager";
import Background from "@/components/Background";
import ProceedButton from "@/components/ProceedButton";
import HeaderComponent from "@/components/HeaderComponent";
import GifOverlay from "@/components/GifOverlay";

const shopData = [
  {
    id: 1,
    name: "Coffee",
    image: "/images/shops/coffee.png",
    item: "Coffee Cup",
    recipe: {
      "Coffee Beans": { qty: 2, cost: 4 },
      Sugar: { qty: 1, cost: 3 },
      Milk: { qty: 1, cost: 3 },
    },
  },
  {
    id: 2,
    name: "Lemonade",
    image: "/images/shops/lemonade.png",
    item: "Lemonade Glass",
    recipe: {
      Lemons: { qty: 1, cost: 4 },
      Sugar: { qty: 1, cost: 3 },
      Ice: { qty: 1, cost: 2 },
    },
  },
  {
    id: 3,
    name: "Ice Cream",
    image: "/images/shops/icecream.png",
    item: "Ice Cream Scoop",
    recipe: {
      Milk: { qty: 2, cost: 3 },
      Flavour: { qty: 1, cost: 6 },
      Sugar: { qty: 1, cost: 3 },
    },
  },
];

export default function BuyIngredientsPage() {
  const [selectedShops, setSelectedShops] = useState([]);
  const [ingredientQuantities, setIngredientQuantities] = useState({});
  const [balance, setBalance] = useState(0);
  const [initialBalance, setInitialBalance] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [teamAvatar, setTeamAvatar] = useState("");
  const router = useRouter();
  const [selectedShopData, setSelectedShopData] = useState([]);
  const [season, setSeason] = useState("");

  useEffect(() => {
    setSeason(() => {
      const session = gameSessionManager.gameSession;
      return session.iterations[session.currentIteration - 1].season;
    });
  });

  useEffect(() => {
    const b = parseInt(gameSessionManager.get("balance") || "0", 10);
    const shopIds =
      (gameSessionManager.get("iterations") &&
        gameSessionManager.get("iterations")[
          gameSessionManager.get("iterations")?.length - 1
        ]?.selectedShops) ||
      [];
    console.log(shopIds);
    setBalance(b);
    setInitialBalance(b);
    setTeamName(gameSessionManager.get("name"));
    setTeamAvatar(gameSessionManager.get("avatar"));
    setSelectedShops(shopIds);
    const filteredShops = shopData.filter((shop) => shopIds.includes(shop.id));
    setSelectedShopData(filteredShops);
    const initialQuantities = {};
    filteredShops.forEach((shop) => {
      Object.keys(shop.recipe).forEach((ingredient) => {
        initialQuantities[`${shop.id}_${ingredient}`] =
          shop.recipe[ingredient].qty;
      });
    });
    setIngredientQuantities(initialQuantities);
    if (
      gameSessionManager.get("currentIteration") ===
        gameSessionManager.get("iterations")?.length - 1 ||
      !gameSessionManager.get("iterations")
    ) {
      alert("Choose shops for this iteration first then buy ingredients!");
      router.back();
    } else if (
      gameSessionManager.get("currentIteration") ===
        gameSessionManager.get("iterations")?.length &&
      gameSessionManager.get("iterations")[
        gameSessionManager.get("iterations").length - 1
      ].ingredientPurchaseSummary
    ) {
      alert(
        "You've already chosen ingredients for this iteration!, move ahead"
      );
      router.push("/sell-items");
    }
  }, []);

  useEffect(() => {
    const totalCost = calculateTotalCost(ingredientQuantities);
    setBalance(initialBalance - totalCost);
  }, [ingredientQuantities]);

  const handleSliderChange = (shopId, ingredient, value) => {
    const key = `${shopId}_${ingredient}`;
    const parsedValue = parseInt(value, 10);
    const updatedQuantities = { ...ingredientQuantities, [key]: parsedValue };
    const newTotalCost = calculateTotalCost(updatedQuantities);

    if (newTotalCost <= initialBalance) {
      setIngredientQuantities(updatedQuantities);
    }
  };

  const calculateTotalCost = (quantities) => {
    let total = 0;
    selectedShops.forEach((id) => {
      const shop = shopData.find((s) => s.id === id);
      Object.entries(shop.recipe).forEach(([ingredient, { cost }]) => {
        const key = `${id}_${ingredient}`;
        const qty = quantities[key] || 0;
        total += qty * cost;
      });
    });
    return total;
  };

  const canMakeAtLeastOneItem = (shop) => {
    return Object.entries(shop.recipe).every(([ingredient, { qty }]) => {
      const boughtQty = ingredientQuantities[`${shop.id}_${ingredient}`] || 0;
      return boughtQty >= qty;
    });
  };

  const handleProceed = () => {
    const ingredientPurchaseSummary = [];

    for (let shop of selectedShopData) {
      if (!canMakeAtLeastOneItem(shop)) {
        alert(
          `You must buy enough ingredients to make at least one ${shop.item} from ${shop.name}.`
        );
        return;
      }
      const shopSummary = {
        shopId: shop.id,
        shopName: shop.name,
        itemName: shop.item,
        ingredients: [],
        totalShopCost: 0,
      };
      Object.entries(shop.recipe).forEach(([ingredient, { qty, cost }]) => {
        const key = `${shop.id}_${ingredient}`;
        const purchasedQty = ingredientQuantities[key] || 0;
        const totalIngredientCost = purchasedQty * cost;
        shopSummary.ingredients.push({
          name: ingredient,
          quantity: purchasedQty,
          unitCost: cost,
          totalCost: totalIngredientCost,
        });
        shopSummary.totalShopCost += totalIngredientCost;
      });
      ingredientPurchaseSummary.push(shopSummary);
    }
    const totalCost = ingredientPurchaseSummary.reduce(
      (acc, shop) => acc + shop.totalShopCost,
      0
    );
    const remainingBalance = initialBalance - totalCost;
    const iterations = gameSessionManager.get("iterations") || [];
    gameSessionManager.set("balance", remainingBalance);
    if (iterations.length > 0) {
      iterations[iterations.length - 1].ingredientPurchaseSummary =
        ingredientPurchaseSummary;
      gameSessionManager.set("iterations", iterations);
    }
    // alert(`Total Cost: ₹${totalCost}`);
    router.push("/sell-items");
  };

  return (
    <div className={styles.container}>
      <Background
        url={
          season && season.name === "Winter season"
            ? "winterBackground.png"
            : "noTextBackground.jpg"
        }
        styleObj={
          season?.name === "Rainy season"
            ? { filter: "brightness(80%) contrast(80%)" }
            : season?.name === "Summer season"
            ? { filter: "brightness(140%) contrast(140%)" }
            : undefined
        }
      />
      <GifOverlay
        url={
          season.name === "Winter season"
            ? "/images/snowfall.gif"
            : season.name === "Rainy season"
            ? "/images/rain.gif"
            : season.name === "Summer season"
            ? "/images/summerOverlay.gif"
            : null
        }
      />
      <HeaderComponent
        avatar={teamAvatar}
        name={teamName}
        heading={"Buy Ingredients"}
        balance={balance}
      />
      <div className={styles.cardGrid}>
        {selectedShopData.map((shop) => (
          <div key={shop.id} className={styles.card}>
            <img src={shop.image} alt={shop.name} className={styles.image} />
            <h3 className={styles.shopName}>{shop.name}</h3>
            <p className={styles.itemName}>{shop.item}</p>
            <p className={styles.costLabel}>
              Ingredients to make 1 {shop.item}:
            </p>
            <ul className={styles.recipeList}>
              {Object.entries(shop.recipe).map(
                ([ingredient, { qty, cost }]) => (
                  <li key={ingredient} className={styles.recipeItem}>
                    {ingredient}: {qty} × ₹{cost} = ₹{qty * cost}
                  </li>
                )
              )}
            </ul>
            <div className={styles.sliderGroup}>
              {Object.entries(shop.recipe).map(
                ([ingredient, { qty, cost }]) => {
                  const key = `${shop.id}_${ingredient}`;
                  const value = ingredientQuantities[key] || qty;
                  return (
                    <div key={ingredient} className={styles.sliderItem}>
                      <label>
                        {ingredient}: {value} units
                      </label>
                      <input
                        type="range"
                        min={qty}
                        max={qty * 1000}
                        value={value}
                        step={qty * 10}
                        onChange={(e) =>
                          handleSliderChange(
                            shop.id,
                            ingredient,
                            e.target.value
                          )
                        }
                        className={styles.slider}
                      />
                    </div>
                  );
                }
              )}
            </div>
          </div>
        ))}
      </div>
      <ProceedButton func={handleProceed}>Proceed to Sell</ProceedButton>
    </div>
  );
}
