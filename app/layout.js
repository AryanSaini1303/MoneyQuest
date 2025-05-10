import "./globals.css";

export const metadata = {
  title: "Money Quest",
  description:
    "Step into the world of MoneyQuest — an interactive, kid-friendly investment simulation game designed for students from Grades 5 to 9. Students form teams, choose playful avatars, and navigate fun seasonal challenges where they invest virtual money in businesses and learn the basics of budgeting, risk-taking, and teamwork. With vibrant animations, engaging decision-making scenarios, and a competitive leaderboard, MoneyQuest turns financial literacy into an exciting adventure of strategy, growth, and smart choices — all in a safe, imaginative environment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
