const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const { v4: uuidv4 } = require('uuid'); // Unique file name generator
require("dotenv").config(); // Load environment variables from .env file

const router = express.Router();

router.use(bodyParser.json());

// 1️⃣ Ensure Audio Directory Exists
const audioFilesDir = path.join(__dirname, '../audio_files/');
if (!fs.existsSync(audioFilesDir)) {
  fs.mkdirSync(audioFilesDir);
}

// 2️⃣ Synthesize Route
router.post("/synthesize", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, message: "Text is required for synthesis." });
  }

  // 3️⃣ Setup Speech Config
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_REGION
  );
  speechConfig.speechSynthesisVoiceName = "en-US-AvaNeural";

  // 4️⃣ Generate Unique File Name
  const uniqueFileName = `synthesized_audio_${uuidv4()}.wav`;
  const outputFilePath = path.join(audioFilesDir, uniqueFileName); 

  // 5️⃣ Configure the Audio File
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputFilePath);
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  synthesizer.speakTextAsync(
    text,
    result => {
      if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
        console.log(`✅ Audio synthesis completed. File saved as: ${uniqueFileName}`);

        // Send the file path back to the client
        const audioFileUrl = `https://thera.koyeb.app/audio_files/${uniqueFileName}`;
        res.status(200).json({
          success: true,
          audioFile: audioFileUrl
        });

        // 🔥 Schedule File Deletion After 5 Minutes (300,000 ms)
        setTimeout(() => {
          const filePath = path.join(audioFilesDir, uniqueFileName);
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(`❌ Failed to delete file ${uniqueFileName}:`, err);
              } else {
                console.log(`🗑️ File deleted: ${uniqueFileName}`);
              }
            });
          }
        }, 5 * 60 * 1000); // 5 minutes = 300,000 ms

      } else {
        console.error("❌ Synthesis failed: ", result.errorDetails);
        res.status(500).json({ success: false, message: "Synthesis failed." });
      }
      synthesizer.close();
    },
    error => {
      console.error("❌ Error during synthesis: ", error);
      res.status(500).json({ success: false, message: "Synthesis failed." });
      synthesizer.close();
    }
  );
});

module.exports = router;
