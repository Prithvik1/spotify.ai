import React, { useState } from "react";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./App.css";

const genAI = new GoogleGenerativeAI("AIzaSyDMryOCHpwvxSmf8FbHuhNrohlYZ_BeJfU"); // 🔁 Replace with your actual key

function App() {
  const [mood, setMood] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mood.trim()) return;
    setLoading(true);
    setSongs([]);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are a music mood expert. Based on the mood "${mood}", suggest exactly 5 songs in the format: Song Name - Artist. No numbering, no explanation.`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();

      // Parse response into song objects
      const parsedSongs = text
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [name, artist] = line.split(" - ").map((str) => str.trim());
          return { name, artist };
        });

      const res = await axios.post("http://localhost:5000/api/search", {
        songs: parsedSongs,
      });

      setSongs(res.data);
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="app-container">
      <h1>🎧 Mood-to-Music Recommender</h1>
      <input
        type="text"
        placeholder="What's your mood?"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Thinking..." : "Get Songs"}
      </button>

      <ul>
        {songs.map((song, index) => (
          <li key={index}>
            <strong>{song.name}</strong> by {song.artist} —{" "}
            <a href={song.url} target="_blank" rel="noreferrer">
              Listen on Spotify
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
