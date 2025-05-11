"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Background from "@/components/Background";

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
  const teamBalance = 10000;
  const [investments, setInvestments] = useState({});
  const [teamData, setTeamData] = useState("");

  useEffect(() => {
    setTeamId(sessionStorage.getItem("teamId") || "1");
  }, []);

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
      console.log(data);
      data.success && setTeamData(data.data[0]);
    };
    getTeamData();
  }, []);

  return (
    <div className={styles.wrapper}>
      <Background url="noTextBackground.jpg" />
      <div className={styles.header}>
        {teamData ? (
          <>
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
          </>
        ) : (
          <p style={{ margin: "2rem auto" }}>Loading...</p>
        )}
      </div>

      {/* <h1 className={styles.heading}>Investment Round</h1>
      <p className={styles.subtext}>Think smart, invest wisely</p> */}
      <div className={styles.grid}>
        <div className={styles.seasonCard}>
          <h2 className={styles.seasonTitle}>{seasons[0].name}</h2>
          <p className={styles.seasonDesc}>{seasons[0].description}</p>
          <p className={styles.note}>Note: You can invest in maximum 2 shops</p>
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
                  <strong>Profit Margin:</strong> {shop.profitMarginPercent}%
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
                    handleInvestmentChange(shop.id, parseInt(e.target.value))
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
    </div>
  );
}
