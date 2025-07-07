import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express(); 

app.use(cors());
app.use(express.json());

let accessToken = "";

async function getAccessToken() {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  accessToken = response.data.access_token;
}

app.post("/api/search", async (req, res) => {
  const { songs } = req.body;
  if (!accessToken) await getAccessToken();

  try {
    const results = [];

    for (const song of songs) {
      const query = `${song.name} ${song.artist}`;
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const track = response.data.tracks.items[0];
      if (track) {
        results.push({
          name: track.name,
          artist: track.artists.map((a) => a.name).join(", "),
          url: track.external_urls.spotify,
        });
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Error searching songs:", err.response?.data || err);
    res.status(500).send("Error searching songs");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
