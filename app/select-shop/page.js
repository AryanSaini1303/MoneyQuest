"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import gameSessionManager from "@/utils/GameSessionManager";
import Background from "@/components/Background";
import ProceedButton from "@/components/ProceedButton";
import { useRouter } from "next/navigation";
import HeaderComponent from "@/components/HeaderComponent";
import GifOverlay from "@/components/GifOverlay";
import Loader from "@/components/Loader";

const shops = [
  { id: 1, name: "Coffee", price: 20000, image: "/images/shops/coffee.png" },
  {
    id: 2,
    name: "Lemonade",
    price: 18000,
    image: "/images/shops/lemonade.png",
  },
  {
    id: 3,
    name: "Ice Cream",
    price: 22000,
    image: "/images/shops/iceCream.png",
  },
];

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

export default function SelectShopsPage() {
  const [selectedShops, setSelectedShops] = useState([]);
  const [balance, setBalance] = useState(100000);
  const [season, setSeason] = useState("");
  const [teamId, setTeamId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [teamData, setTeamData] = useState("");
  const router = useRouter();
  const [iteration, setIteration] = useState();

  // useEffect(() => {
  //   function handlePopState() {
  //     console.log("pop");
  //   }
  //   window.addEventListener("popstate", handlePopState);
  // }, []);

  useEffect(() => {
    const savedTeamId = sessionStorage.getItem("teamId");
    const savedRoomId = sessionStorage.getItem("roomId");
    if (savedTeamId) setTeamId(savedTeamId);
    if (savedRoomId) setRoomId(savedRoomId);
    setSeason(
      seasons[Math.floor(Math.random() * Object.values(seasons).length)]
    );
    const savedShops = gameSessionManager.get("selectedShops");
    const savedBalance = gameSessionManager.get("balance");
    if (savedShops) setSelectedShops(savedShops);
    if (savedBalance) setBalance(savedBalance);
    const session = gameSessionManager.gameSession;
    if (!session) return;
    const currentIteration = session.currentIteration || 1;
    setIteration(currentIteration);

    const getTeamData = async () => {
      const res = await fetch(
        `/api/getTeamData?team_id=${sessionStorage.getItem("teamId")}`
      );
      const data = await res.json();
      // console.log(data);
      data.success && setTeamData(data.data[0]);
      if (data.error) {
        alert("Please form a team first!");
        setTimeout(() => {
          router.replace("/");
        }, [0]);
        return;
      }
      gameSessionManager.set("name", data.data[0].name);
      gameSessionManager.set("avatar", data.data[0].avatar);
    };
    getTeamData();

    const cheapestShop = shops.reduce((min, shop) =>
      shop.price < min.price ? shop : min
    );
    if (cheapestShop.price > (savedBalance || 100000)) {
      alert("You don't have enough balance to invest in any shop. Game Over.");
      setTimeout(() => {
        router.replace("/");
      }, 0);
      // The issue was that `router.replace("/")` inside `useEffect` after an `alert()` didn’t work reliably due to the blocking nature of `alert()` during initial render. Wrapping the navigation in `setTimeout(() => router.replace("/"), 0)` ensures it runs after the alert and React initialization.
      return;
    }

    if (currentIteration && currentIteration === session.iterations?.length) {
      alert("You've already chosen shops for this iteration!, move ahead");
      router.replace("/buy-ingredients");
      return;
    }
  }, []);

  useEffect(() => {
    if (iteration !== undefined && iteration <= 7) {
      gameSessionManager.set("currentIteration", iteration);
    }
  }, [iteration]);

  const calculateRemainingBalance = (newSelection) => {
    const totalCost = newSelection.reduce((acc, shopId) => {
      const shop = shops.find((s) => s.id === shopId);
      return acc + shop.price;
    }, 0);
    // console.log((gameSessionManager.get("balance") || 100000) - totalCost);
    return (gameSessionManager.get("balance") || 100000) - totalCost;
  };

  const handleShopSelection = (shopId) => {
    setSelectedShops((prev) => {
      let newSelection;
      const newShop = shops.find((s) => s.id === shopId);
      const currentCost = prev.reduce((acc, id) => {
        const s = shops.find((shop) => shop.id === id);
        return acc + s.price;
      }, 0);

      if (prev.includes(shopId)) {
        newSelection = prev.filter((id) => id !== shopId);
      } else {
        if (currentCost + newShop.price > balance) {
          alert("Not enough balance to add this shop.");
          return prev;
        }
        newSelection = [...prev, shopId];
      }

      setBalance(calculateRemainingBalance(newSelection));
      return newSelection;
    });
  };

  const handleSubmit = () => {
    if (selectedShops.length === 0) {
      alert("Please select at least one shop.");
      return;
    }
    const previousIterations = gameSessionManager.get("iterations") || [];
    const iterationObj = {
      selectedShops: selectedShops,
      season: season,
    };
    const updatedIterations = [...previousIterations, iterationObj];
    gameSessionManager.set("iterations", updatedIterations);
    gameSessionManager.set("balance", balance);
    gameSessionManager.set("teamId", teamId);
    gameSessionManager.set("roomId", roomId);
    router.replace("/buy-ingredients");
  };

  return (
    <>
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
      {season && Object.keys(teamData).length != 0 ? (
        <>
          <HeaderComponent
            avatar={teamData.avatar}
            name={teamData.name}
            heading={"Select Shops"}
            balance={balance}
          />
          <div className={styles.container}>
            <div className={styles.seasonCard}>
              <h3 style={{ margin: "0" }}>Iteration: {iteration}</h3>
              <h2 className={styles.seasonTitle}>{season.name}</h2>
              <p className={styles.seasonDesc}>{season.description}</p>
              {/* <p className={styles.note}>Note: You can invest in maximum 2 shops</p> */}
            </div>
            <div className={styles.shopList}>
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className={`${styles.shopCard} ${
                    selectedShops.includes(shop.id) ? styles.selected : ""
                  }`}
                  onClick={() => handleShopSelection(shop.id)}
                >
                  <img src={shop.image} alt={shop.name} />
                  <h2>{shop.name}</h2>
                  <p>Price: ₹{shop.price}</p>
                </div>
              ))}
            </div>
            <ProceedButton
              func={handleSubmit}
              disabled={selectedShops.length === 0}
            >
              Proceed to Next Page
            </ProceedButton>
          </div>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
}
