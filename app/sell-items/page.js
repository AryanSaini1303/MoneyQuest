"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import gameSessionManager from "@/utils/GameSessionManager";
import Background from "@/components/Background";
import ProceedButton from "@/components/ProceedButton";
import { useRouter } from "next/navigation";
import HeaderComponent from "@/components/HeaderComponent";
import GifOverlay from "@/components/GifOverlay";
import Loader from "@/components/Loader";

const RECIPES = {
  Coffee: {
    "Coffee Beans": { qty: 2 },
    Sugar: { qty: 1 },
    Milk: { qty: 1 },
  },
  Lemonade: {
    Lemons: { qty: 1 },
    Sugar: { qty: 2 },
    Ice: { qty: 1 },
  },
  "Ice Cream": {
    Milk: { qty: 2 },
    Flavour: { qty: 1 },
    Sugar: { qty: 1 },
  },
};

const PRICE_RANGES = {
  Coffee: { ideal: [22, 28], low: 22, high: 35 },
  Lemonade: { ideal: [18, 24], low: 18, high: 32 },
  "Ice Cream": { ideal: [25, 30], low: 25, high: 40 },
};

const OPERATIONAL_COSTS = {
  Coffee: 3,
  Lemonade: 2,
  "Ice Cream": 4,
};

const SEASONAL_BOOSTS = {
  Coffee: { season: "Winter", boostMultiplier: 1.3, penaltyMultiplier: 0.8 },
  Lemonade: { season: "Summer", boostMultiplier: 1.2, penaltyMultiplier: 0.7 },
  "Ice Cream": {
    season: "Summer",
    boostMultiplier: 1.3,
    penaltyMultiplier: 0.7,
  },
};

const shops = [
  { id: 1, name: "Coffee", price: 20000 },
  {
    id: 2,
    name: "Lemonade",
    price: 18000,
  },
  {
    id: 3,
    name: "Ice Cream",
    price: 22000,
  },
];

const calculateMaxItems = (ingredients, recipe) => {
  const possibleCounts = Object.keys(recipe).map((ingredientName) => {
    const requiredQty = recipe[ingredientName].qty;
    const available =
      ingredients.find((i) => i.name === ingredientName)?.quantity || 0;
    return Math.floor(available / requiredQty);
  });
  return Math.min(...possibleCounts);
};

const getSalePercentage = (price, shopName) => {
  const { ideal, low, high } = PRICE_RANGES[shopName];
  if (price < low) return 0.9;
  if (price >= ideal[0] && price <= ideal[1]) {
    return 0.9 + Math.random() * 0.6;
  }
  if (price > ideal[1] && price <= high) {
    const range = high - ideal[1];
    const delta = price - ideal[1];
    const decayFactor = delta / range;
    const sale = 0.9 * Math.pow(1 - decayFactor, 2); // quadratic fall
    return Math.max(0.1, sale);
  }
  if (price > high) {
    return 0;
  }
  return 0.02 + Math.random() * 0.03;
};

const SellItems = () => {
  const [shopProductions, setShopProductions] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [teamAvatar, setTeamAvatar] = useState("");
  const [balance, setBalance] = useState(0);
  const [hideButton, setHideButton] = useState(false);
  const [shopsPurchaseCost, setShopsPurchaseCost] = useState(0);
  const [totalNetProfit, setTotalNetProfit] = useState(0);
  const [gameEnd, setGameEnd] = useState(false);
  const [season, setSeason] = useState("");
  const [sessionData, setSessionData] = useState();

  useEffect(() => {
    if (!gameSessionManager.get("teamId")) {
      alert("Please form a team first!");
      setTimeout(() => {
        router.replace("/");
      }, [0]);
      return;
    } else {
      const currentIteration = gameSessionManager.get("currentIteration") || 0;
      const iterations = gameSessionManager.get("iterations") || [];
      if (currentIteration > iterations.length) {
        alert("You've already invested, please proceed to next iteration.");
        setTimeout(() => {
          router.replace("/select-shop");
        }, 0);
        return;
      }
      setSeason(() => {
        const session = gameSessionManager.gameSession;
        return session.iterations[session.currentIteration - 1]?.season;
      });
      if (!iterations.length) return;
      const { ingredientPurchaseSummary } =
        iterations[currentIteration - 1] || iterations[currentIteration - 2];
      setTeamName(gameSessionManager.get("name"));
      setTeamAvatar(gameSessionManager.get("avatar"));
      setBalance(gameSessionManager.get("balance"));
      const calculated = ingredientPurchaseSummary.map((shop) => {
        const recipe = RECIPES[shop.shopName];
        const producibleCount = calculateMaxItems(shop.ingredients, recipe);
        return {
          shopName: shop.shopName,
          itemName: shop.itemName,
          ingredients: shop.ingredients,
          producibleCount,
          price: "",
          unitsSold: 0,
          totalRevenue: 0,
          operationalCost: 0,
          netProfit: 0,
          confirmed: false,
        };
      });
      setShopProductions(calculated);
      const currentSummary =
        iterations[currentIteration - 1]?.investmentSummary;
      if (Array.isArray(currentSummary) && currentSummary.length !== 0) {
        if (currentIteration !== 7) {
          alert("You've already invested, please proceed to next iteration.");
          router.replace("/select-shop");
        } else if (currentIteration === 7) {
          alert(
            "The Game has ended, Admin will show you the leaderboard in no time. Meanwhile, you can join another room"
          );
          router.replace("/");
        }
      }
    }
  }, []);

  const handlePriceInput = (shopName, value) => {
    setInputValues((prev) => ({ ...prev, [shopName]: value }));
  };

  const handleAllConfirm = () => {
    const session = gameSessionManager.gameSession;
    const currentIterationIndex = session.currentIteration - 1;
    // Validate all selected shop inputs
    const selectedShopNames = session.iterations[
      currentIterationIndex
    ].selectedShops.map((id) => shops.find((shop) => shop.id === id)?.name);
    const missingInputShop = shopProductions.find((shop) => {
      if (!selectedShopNames.includes(shop.shopName)) return false;
      const priceStr = inputValues[shop.shopName];
      const price = parseFloat(priceStr);
      return !priceStr || isNaN(price);
    });

    if (missingInputShop) {
      alert(`Please enter a valid price for ${missingInputShop.shopName}.`);
      return;
    }
    setHideButton(true);
    const updated = shopProductions.map((shop) => {
      const price = parseFloat(inputValues[shop.shopName]);
      const salePercentage = getSalePercentage(price, shop.shopName);
      const currentSeason = gameSessionManager.get("currentSeason");
      const { season, boostMultiplier, penaltyMultiplier } =
        SEASONAL_BOOSTS[shop.shopName];
      const seasonalMultiplier =
        currentSeason === season ? boostMultiplier : penaltyMultiplier;
      const unitsSold = Math.floor(
        shop.producibleCount * salePercentage * seasonalMultiplier
      );
      let totalRevenue = unitsSold * price;
      const operationalCost = unitsSold * OPERATIONAL_COSTS[shop.shopName];
      // totalRevenue *= seasonalMultiplier;
      const netProfit = totalRevenue - operationalCost;
      const totalInvestment = shop.ingredients.reduce(
        (sum, ing) => sum + ing.unitCost * ing.quantity,
        0
      );
      return {
        ...shop,
        price,
        totalInvestment,
        unitsSold,
        totalRevenue,
        operationalCost,
        netProfit,
        confirmed: true,
      };
    });
    setShopProductions(updated);
    const investmentSummary = updated.map((shop) => ({
      shopName: shop.shopName,
      itemName: shop.itemName,
      price: shop.price,
      producibleCount: shop.producibleCount,
      unitsSold: shop.unitsSold,
      totalRevenue: shop.totalRevenue,
      operationalCost: shop.operationalCost,
      totalInvestment: shop.totalInvestment,
      netProfit: shop.netProfit,
    }));
    shops.map((shop) => {
      if (
        session.iterations[currentIterationIndex].selectedShops.includes(
          shop.id
        )
      ) {
        setShopsPurchaseCost((prev) => (prev += shop.price));
      }
    });
    if (session.currentIteration < 7 && session.currentIteration > 0) {
      session.currentIteration += 1;
    }
    session.iterations[currentIterationIndex].investmentSummary =
      investmentSummary;
    setSessionData(session);
    sessionStorage.setItem("gameSession", JSON.stringify(session));
    gameSessionManager.gameSession.iterations[
      currentIterationIndex
    ].investmentSummary.forEach((investment) => {
      setTotalNetProfit((prev) => prev + investment.netProfit);
    });
  };

  useEffect(() => {
    if (
      shopsPurchaseCost !== 0 &&
      gameSessionManager.get("currentIteration") !== 7
    ) {
      const prevBalance = gameSessionManager.get("balance");
      // console.log("prevBalance", prevBalance);
      gameSessionManager.set("balance", prevBalance + shopsPurchaseCost);
      setBalance(gameSessionManager.get("balance"));
    }
  }, [shopsPurchaseCost]);

  useEffect(() => {
    if (totalNetProfit !== 0) {
      const prevBalance = gameSessionManager.get("balance");
      gameSessionManager.set("balance", prevBalance + totalNetProfit);
      setBalance(gameSessionManager.get("balance"));
    }
  }, [totalNetProfit]);

  useEffect(() => {
    if (sessionData && Object.keys(sessionData.iterations).length == 7) {
      setGameEnd(true);
      const sendAllIterationsData = async () => {
        try {
          const res = await fetch("/api/saveSessionData", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              teamId: sessionData.teamId,
              roomId: sessionData.roomId,
              sessionData: sessionData,
            }),
          });
          const data = await res.json();
          if (data.success) {
            console.log("Full iterations data successfully sent to server.");
            sessionStorage.clear();
          }
        } catch (error) {
          console.error("Error sending all iterations data:", error);
        }
      };
      sendAllIterationsData();
    }
  }, [sessionData]);

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
          season && season.name === "Winter season"
            ? "/images/snowfall.gif"
            : season.name === "Rainy season"
            ? "/images/rain.gif"
            : season.name === "Summer season"
            ? "/images/summerOverlay.gif"
            : null
        }
      />
      {teamAvatar.length != 0 && teamName.length != 0 && balance.length != 0 ? (
        <>
          <HeaderComponent
            avatar={teamAvatar}
            name={teamName}
            heading={"Set Price"}
            balance={balance}
          />
          <h2 className={styles.heading}>Sales Summary</h2>
          <div className={styles.grid}>
            {shopProductions.map((shop) => (
              <div className={styles.card} key={shop.shopName}>
                <img
                  src={`/images/shops/${
                    shop.shopName == "Ice Cream"
                      ? "iceCream"
                      : shop.shopName.toLowerCase()
                  }.png`}
                  alt={shop.shopName}
                  className={styles.shopImage}
                />
                <div className={styles.shopHeader}>
                  <div>
                    <h3>{shop.shopName}</h3>
                    <p>Item: {shop.itemName}</p>
                    <p>Can Produce: {shop.producibleCount}</p>
                  </div>
                </div>
                {!shop.confirmed && (
                  <label className={styles.priceInput}>
                    Set Price: ₹{" "}
                    <input
                      type="number"
                      min="1"
                      value={inputValues[shop.shopName] || ""}
                      onChange={(e) =>
                        handlePriceInput(shop.shopName, e.target.value)
                      }
                    />{" "}
                    / {shop.itemName}
                  </label>
                )}
                {shop.confirmed && (
                  <div className={styles.salesDetails}>
                    <p>Set Price: {shop.price}</p>
                    <p>Units Sold: {shop.unitsSold}</p>
                    <p>Total Revenue: ₹{shop.totalRevenue.toFixed(2)}</p>
                    <p>Operational Cost: ₹{shop.operationalCost.toFixed(2)}</p>
                    <p>Total Investment: ₹{shop.totalInvestment.toFixed(2)}</p>
                    <p
                      style={
                        shop.netProfit.toFixed(2) -
                          shop.totalInvestment.toFixed(2) <
                        0
                          ? { color: "red" }
                          : { color: "green" }
                      }
                    >
                      <strong>
                        {shop.netProfit.toFixed(2) -
                          shop.totalInvestment.toFixed(2) <
                        0
                          ? "Loss: "
                          : "Profit: "}{" "}
                        ₹
                        {shop.netProfit.toFixed(2) -
                          shop.totalInvestment.toFixed(2) <
                        0
                          ? -(
                              shop.netProfit.toFixed(2) -
                              shop.totalInvestment.toFixed(2)
                            )
                          : shop.netProfit.toFixed(2) -
                            shop.totalInvestment.toFixed(2)}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <ProceedButton
            func={
              !hideButton
                ? handleAllConfirm
                : () => {
                    if (!gameEnd) {
                      router.replace("/select-shop");
                    } else {
                      alert(
                        "The Game has ended, Admin will show you the leaderboard in no time. Meanwhile, you can join another room"
                      );
                      router.replace("/");
                    }
                  }
            }
            styleObj={{ margin: "1rem auto", display: "block" }}
          >
            {!hideButton ? "Submit Prices" : "Invest Again"}
          </ProceedButton>
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default SellItems;
