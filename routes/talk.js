require('dotenv').config();
const axios = require('axios');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());    
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const router = express.Router();

async function getTheraResponse(userQuestion) {
    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            { text: `Act as a therapist and help the patient calm down by answering the following questions: "${userQuestion}". Your response should reflect as a doctor and saviour to the patient.` }
                        ]
                    }
                ]
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        // Extract and return the content from the response
        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Error fetching response:", error);
        return "I am here to guide u but, i am facing some problems";
    }
}

// Endpoint to interact with Swami
router.post('/talk', async (req, res) => {
    const { question } = req.body;
    const TheraResponse = await getTheraResponse(question);
    res.json({ answer: TheraResponse });
});

module.exports = router;

