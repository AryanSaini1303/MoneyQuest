"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Background from "@/components/Background";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import GifOverlay from "@/components/GifOverlay";

const seasons = [
  {
    name: "Winter season",
    description:
      "As temperatures drop, there's a surge in demand for warm clothing, heaters, hot beverages, and comfort foods. Consumers seek cozy experiences, making it an ideal season for apparel, cafés, and indoor activities.",
  },
  {
    name: "Summer season",
    description:
      "The heat drives people towards cooling products like ice creams, beverages, air conditioners, and light cotton apparel. Tourism also peaks, boosting businesses in travel, water parks, and summer wear.",
  },
  {
    name: "Rainy season",
    description:
      "Frequent showers create a high demand for umbrellas, raincoats, waterproof gear, and hot street food. People also turn to indoor entertainment, making it a great time for food delivery, streaming services, and comfort accessories.",
  },
];

// season should be fixed for all the teams in the room

const shops = [
  {
    id: 1,
    shopName: "Ice Cream Shop",
    demandSeason: "Summer",
    profitMarginPercent: 30,
    inventoryRiskLevel: 3,
    seasonBoostMultiplier: 2.0,
    description:
      "Sells frozen desserts that are highly popular during hot summer months.",
    image: "/images/shops/iceCream.png",
  },
  {
    id: 2,
    shopName: "Lemonade Stand",
    demandSeason: "Summer",
    profitMarginPercent: 40,
    inventoryRiskLevel: 2,
    seasonBoostMultiplier: 1.8,
    description:
      "Offers refreshing lemonade, attracting customers mainly in the summer heat.",
    image: "/images/shops/lemonade.png",
  },
  {
    id: 3,
    shopName: "Tool & Repair Shop",
    demandSeason: "Rainy",
    profitMarginPercent: 25,
    inventoryRiskLevel: 1,
    seasonBoostMultiplier: 1.5,
    description:
      "Provides essential tools and repair services, with increased demand during rain-related issues.",
    image: "/images/shops/tools.png",
  },
  {
    id: 4,
    shopName: "Umbrella & Rainwear",
    demandSeason: "Rainy",
    profitMarginPercent: 35,
    inventoryRiskLevel: 1,
    seasonBoostMultiplier: 2.5,
    description:
      "Specializes in umbrellas and rainwear, peaking in the monsoon season.",
    image: "/images/shops/clothing.png",
  },
  {
    id: 5,
    shopName: "Winter Hats & Gloves",
    demandSeason: "Winter",
    profitMarginPercent: 30,
    inventoryRiskLevel: 1,
    seasonBoostMultiplier: 2.0,
    description:
      "Sells winter accessories to keep customers warm during cold weather.",
    image: "/images/shops/hats.png",
  },
  {
    id: 6,
    shopName: "Coffee & Cocoa Cart",
    demandSeason: "Winter",
    profitMarginPercent: 45,
    inventoryRiskLevel: 2,
    seasonBoostMultiplier: 2.0,
    description:
      "Serves hot beverages like coffee and cocoa, ideal for chilly winter days.",
    image: "/images/shops/coffee.png",
  },
];

export default function InvestmentRoundPage() {
  const [teamId, setTeamId] = useState("");
  const teamBalance = 100000;
  const [investments, setInvestments] = useState({});
  const [teamData, setTeamData] = useState("");
  const [season, setSeason] = useState("");
  const [results, setResults] = useState([]);
  const [updated, setUpdated] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function getRiskEmojiAndMessage(modifier) {
    if (modifier >= 0.8) return "🟢 Safe Zone! Probably";
    if (modifier >= 0.5) return "🟡 Hmm... Medium risk. Could go either way!";
    return "🔴 Uh-oh! High risk! But High returns too";
  }

  function handleInvest() {
    selectedShops.forEach((shopIdStr) => {
      const shopId = parseInt(shopIdStr);
      const shop = shops.find((s) => s.id === shopId);
      const investedAmount = investments[shopId];
      // Calculating base profit
      const profitMarginMultiplier = 1 + shop.profitMarginPercent / 100;
      const seasonMultiplier = // finding season profit multiplier
        shop.demandSeason.toLowerCase() ===
        season.name.toLowerCase().split(" ")[0]
          ? shop.seasonBoostMultiplier
          : Math.random() * 0.5 + 0.4; // penalty multiplier: 0.4x to 0.9x;
      // Risk Modifier
      let riskModifier = 1; // default: no impact
      if (shop.inventoryRiskLevel === 1) {
        // Low Risk → 0.8x to 1.0x
        riskModifier = Math.random() * 0.2 + 0.8;
      } else if (shop.inventoryRiskLevel === 2) {
        // Medium Risk → 0.5x to 1.1x
        riskModifier = Math.random() * 0.6 + 0.5;
      } else if (shop.inventoryRiskLevel === 3) {
        // High Risk → 0.1x to 1.2x
        riskModifier = Math.random() * 1.1 + 0.1;
      }
      // net return amount of a particular shop
      const returnAmount =
        investedAmount *
        profitMarginMultiplier *
        seasonMultiplier *
        riskModifier;
      setResults((prev) => [
        ...prev,
        {
          shopName: shop.shopName,
          invested: investedAmount,
          returnAmount: Math.round(returnAmount),
          riskModifier: riskModifier.toFixed(2),
        },
      ]);
    });
  }

  useEffect(() => {
    setTeamId(sessionStorage.getItem("teamId") || null);
  }, []);

  useEffect(() => {
    setSeason(() => {
      const randomNumber = Math.floor(Math.random() * 3);
      return seasons[randomNumber];
    });
  }, []); // this sets the season at random

  useEffect(() => {
    if (teamId == null) {
      alert("Unauthorised!");
      router.back();
    }
  }, [teamId]);

  const totalInvested = Object.values(investments).reduce(
    (acc, amt) => acc + amt,
    0
  );
  const selectedShops = Object.keys(investments).filter(
    (key) => investments[key] > 0
  );

  const handleInvestmentChange = (shopId, amount) => {
    const newInvestments = { ...investments };
    // Respect max of 2 shops
    if (amount > 0 && selectedShops.length >= 2 && !newInvestments[shopId])
      return;
    newInvestments[shopId] = amount;
    const total = Object.values(newInvestments).reduce(
      (acc, amt) => acc + amt,
      0
    );
    // Prevent exceeding total balance
    if (total > teamBalance) return;
    setInvestments(newInvestments);
  };

  useEffect(() => {
    const getTeamData = async () => {
      const res = await fetch(
        `/api/getTeamData?team_id=${sessionStorage.getItem("teamId")}`
      );
      const data = await res.json();
      // console.log(data);
      data.success && setTeamData(data.data[0]);
    };
    getTeamData();
  }, []);

  // useEffect(() => {
  //   const getSeason = async () => {
  //     const res = await fetch(
  //       `/api/getSeason?id=${sessionStorage.getItem("roomId")}`
  //     );
  //     const data = await res.json();
  //     // console.log(data);
  //     data.success && setSeason(seasons[data.data[0].season]);
  //   };
  //   getSeason();
  // }, []);

  useEffect(() => {
    if (results.length !== 0) {
      setLoading(true);
      const saveResults = async () => {
        const response = await fetch("/api/saveResults", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            result: results,
            id: teamId,
          }),
        });
        const data = await response.json();
        // console.log("data", data);
        // data.success&&console.log(typeof(data.data[0].id));
        data.success && setUpdated(true);
        setLoading(false);
      };
      saveResults();
    }
  }, [results]);

  return (
    <div className={styles.wrapper}>
      {!(
        Object.values(teamData).length == 0 && Object.values(season).length == 0
      ) && (
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
      )}
      {updated && (
        <section className={styles.results}>
          <h1>Results</h1>
          <div className={styles.cardsContainer}>
            {results.map((result, index) => (
              <div className={styles.card} key={index}>
                <h2 className={styles.shopName}>{result.shopName}</h2>
                <div className={styles.values}>
                  <p>
                    <strong>Invested:</strong> ₹{result.invested}
                  </p>
                  <p>
                    <strong>Return:</strong>{" "}
                    <span
                      style={{
                        color:
                          result.returnAmount < result.invested
                            ? "crimson"
                            : "green",
                        fontWeight: "bold",
                      }}
                    >
                      ₹{result.returnAmount}
                    </span>
                  </p>
                  <p>
                    <strong>Risk:</strong>{" "}
                    <span>
                      {getRiskEmojiAndMessage(parseFloat(result.riskModifier))}
                    </span>
                  </p>
                </div>
              </div>
            ))}
            <button
              className={styles.submit}
              onClick={() => {
                router.replace("/");
                sessionStorage.clear();
              }}
            >
              Return to main screen
            </button>
          </div>
        </section>
      )}
      <Background
        url={
          season.name === "Winter season"
            ? "winterBackground.png"
            : "noTextBackground.jpg"
        }
        styleObj={
          updated
            ? {
                filter: "blur(10px)",
                pointerEvents: "none",
                userSelect: "none",
              }
            : Object.values(season).length != 0 &&
              season.name === "Rainy season"
            ? { filter: "brightness(80%) contrast(80%)" }
            : null
        }
      />
      {Object.values(teamData).length == 0 &&
      Object.values(season).length == 0 ? (
        <Loader />
      ) : (
        <>
          <div
            className={styles.header}
            style={
              updated
                ? {
                    filter: "blur(10px)",
                    pointerEvents: "none",
                    userSelect: "none",
                  }
                : null
            }
          >
            <div className={styles.teamInfo}>
              <img
                src={`/images/avatars/${teamData.avatar}`}
                alt="Team Avatar"
                className={styles.avatar}
              />
              <div>
                <h2 className={styles.teamName}>{teamData.name}</h2>
              </div>
            </div>
            <div className={styles.headerInfoContainer}>
              <h1 className={styles.heading}>Investment Round</h1>
              <p className={styles.subtext}>Think smart, invest wisely</p>
            </div>
            <div className={styles.balanceBox}>
              &#8377;{(teamBalance - totalInvested).toLocaleString()}
              <span className={styles.balanceLabel}>remaining</span>
            </div>
          </div>
          <div
            className={styles.grid}
            style={
              updated
                ? {
                    filter: "blur(10px)",
                    pointerEvents: "none",
                    userSelect: "none",
                  }
                : null
            }
          >
            <div className={styles.seasonCard}>
              <h2 className={styles.seasonTitle}>{season.name}</h2>
              <p className={styles.seasonDesc}>{season.description}</p>
              <p className={styles.note}>
                Note: You can invest in maximum 2 shops
              </p>
            </div>
            <div className={styles.shopGrid}>
              {shops.map((shop) => (
                <div key={shop.id} className={styles.shopCard}>
                  <img
                    src={shop.image}
                    alt={shop.shopName}
                    className={styles.shopImage}
                  />
                  <h3 className={styles.shopTitle}>{shop.shopName}</h3>
                  <p className={styles.shopDesc}>{shop.description}</p>
                  <div className={styles.shopDetails}>
                    <p>
                      <strong>Profit Margin:</strong> {shop.profitMarginPercent}
                      %
                    </p>
                    <p>
                      <strong>Risk Level:</strong>{" "}
                      {["Low", "Moderate", "High"][shop.inventoryRiskLevel - 1]}
                    </p>
                  </div>
                  <div className={styles.sliderContainer}>
                    <input
                      type="range"
                      min="0"
                      max={teamBalance}
                      step="100"
                      value={investments[shop.id] || 0}
                      onChange={(e) =>
                        handleInvestmentChange(
                          shop.id,
                          parseInt(e.target.value)
                        )
                      }
                      className={styles.slider}
                    />
                    <span className={styles.sliderValue}>
                      ₹{investments[shop.id] || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {Object.values(investments).find((investment) => investment != 0) && (
            <button
              className={styles.submit}
              onClick={handleInvest}
              style={
                updated
                  ? {
                      filter: "blur(10px)",
                      pointerEvents: "none",
                      userSelect: "none",
                    }
                  : null
              }
            >
              {loading ? "Calculating returns..." : "Invest Now"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
