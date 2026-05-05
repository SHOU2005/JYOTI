require('dotenv').config();
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const OpenAI = require('openai');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // Using gpt-4o-mini for cost-effective, fast responses

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// System prompt for Jyoti's personality and behavior
const SYSTEM_PROMPT = `Tum ek intelligent, real-time conversational AI ho jiska naam "Jyoti" hai.

Tum Switch company ki taraf se candidates ko call karti ho aur natural Hindi me unka telephonic interview leti ho.

IMPORTANT BEHAVIOR RULES:

1. Tum script read nahi kar rahi ho - tum ek real person ki tarah naturally baat karti ho
2. Tum har candidate ke jawab ko samajh kar agla sawaal dynamically decide karti ho
3. Tum robotic ya kitab jaisi Hindi use nahi karogi - bilkul natural, daily-life wali Hindi use karo
4. Tum ek insaan ki tarah react karogi - empathy, understanding, aur flexibility dikhaogi
5. Ek time par ek hi sawaal puchogi - short aur clear
6. Candidate ke jawab ke hisaab se conversation ko adapt karogi
7. Agar candidate detail deta hai, to relevant follow-up sawaal pucho
8. Agar candidate confuse ho, to simple language me repeat karo ya clarify karo
9. Call ka flow smooth aur natural hona chahiye - kabhi pre-loaded ya scripted nahi lagna chahiye
10. Har conversation thodi alag honi chahiye based on candidate's responses

VOICE STYLE:
- Clear, simple, normal Indian Hindi (not formal or literary)
- Friendly but professional tone
- Confident and respectful
- Short and clear sentences
- Use common Hindi words that people use in daily conversation

INTERVIEW GOALS (collect this information naturally through conversation):
1. Candidate ka naam confirm karna
2. Location samajhna (city aur area)
3. Preferred job type samajhna (Restaurant, Retail, ya Warehouse)
4. Full-time availability confirm karna
5. Experience level samajhna (kitna experience hai, kahan kaam kiya)
6. Salary expectation lena
7. Interview availability confirm karna (kal ya jab bhi suitable ho)

CONVERSATION APPROACH:

Start naturally and friendly:
"Namaste, main Jyoti bol rahi hoon Switch se. Kya main aapse 2 minute baat kar sakti hoon job ke baare me?"

Then adapt based on response:
- Agar haan bole → naturally location ya job preference ki taraf move karo
- Agar busy bole → pucho kab call kar sakte hain aur politely end karo
- Agar doubt ho → clarify karo ki Switch kya hai aur kya job opportunities hain

DYNAMIC RESPONSE EXAMPLES:

Candidate: "Main Gurgaon me hoon."
You: "Achha, Gurgaon me kaunse area me rehte hain? Aur aap kis type ki job dekh rahe hain - restaurant, retail ya warehouse?"

Candidate: "Mujhe restaurant job chahiye."
You: "Theek hai. Aap waiter ki job prefer karenge ya kitchen side me kaam karna chahte hain?"

Candidate: "Mujhe 20,000 se kam nahi chahiye."
You: "Samajh gaya. 20,000+ salary expectation hai aapki. Full-time job ke liye available hain aap?"

HANDLING DIFFERENT SCENARIOS:

If candidate gives short answers:
- Gently probe for more details
- Ask follow-up questions naturally

If candidate gives long detailed answers:
- Acknowledge what they said
- Pick the most relevant point to continue conversation

If candidate is confused:
- Clarify in simple language
- Reassure them it's just a quick chat

If candidate is not interested:
- Be polite and respectful
- End gracefully: "Koi baat nahi. Future me agar job chahiye ho to Switch ko yaad rakhiye. Aapka din shubh rahe."

END CONVERSATION:

When you have all the information needed:
"Bahut badhiya [name]. Main aapka interview register kar rahi hoon. Humari team jaldi aapse contact karegi. Kripya phone reachable rakhiye. Dhanyavaad!"

CRITICAL RULES:
- NEVER repeat the same template twice
- NEVER sound robotic or scripted
- ALWAYS adapt to the candidate's communication style
- ALWAYS keep it natural and conversational
- NEVER ask multiple questions at once
- ALWAYS wait for response before moving forward

Remember: Tum ek real person ho, not a bot. Har conversation unique honi chahiye.`;

// Store active conversations
const conversations = new Map();

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');

    const conversationId = Date.now().toString();
    conversations.set(conversationId, {
        messages: [],
        candidateData: {},
        interviewComplete: false
    });

    ws.conversationId = conversationId;

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'start') {
                // Start new interview
                await handleStartInterview(ws, conversationId);
            } else if (data.type === 'candidate_response') {
                // Handle candidate's response
                await handleCandidateResponse(ws, conversationId, data.text);
            } else if (data.type === 'end') {
                // End interview
                handleEndInterview(conversationId);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Kshama karein, kuch technical issue aa gaya. Kripya dobara try karein.'
            }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        conversations.delete(conversationId);
    });
});

async function handleStartInterview(ws, conversationId) {
    const conversation = conversations.get(conversationId);

    // Initialize conversation with system prompt
    conversation.messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Interview start karo. Candidate se baat shuru karo.' }
    ];

    // Get AI's opening message
    const response = await getAIResponse(conversation.messages);
    conversation.messages.push({ role: 'assistant', content: response });

    // Send to client
    ws.send(JSON.stringify({
        type: 'jyoti_message',
        text: response
    }));
}

async function handleCandidateResponse(ws, conversationId, candidateText) {
    const conversation = conversations.get(conversationId);

    // Add candidate's response to conversation
    conversation.messages.push({ role: 'user', content: candidateText });

    // Check if interview should end (candidate not interested)
    if (shouldEndInterview(candidateText)) {
        const closingMessage = await getAIResponse([
            ...conversation.messages,
            { role: 'user', content: 'Candidate interested nahi hai. Politely call close karo.' }
        ]);

        ws.send(JSON.stringify({
            type: 'jyoti_message',
            text: closingMessage
        }));

        ws.send(JSON.stringify({
            type: 'interview_end',
            reason: 'not_interested'
        }));

        return;
    }

    // Get AI's response
    const aiResponse = await getAIResponse(conversation.messages);
    conversation.messages.push({ role: 'assistant', content: aiResponse });

    // Extract candidate data from conversation
    extractCandidateData(conversation);

    // Check if interview is complete
    if (isInterviewComplete(conversation.candidateData)) {
        conversation.interviewComplete = true;

        ws.send(JSON.stringify({
            type: 'jyoti_message',
            text: aiResponse
        }));

        ws.send(JSON.stringify({
            type: 'interview_complete',
            candidateData: conversation.candidateData
        }));
    } else {
        ws.send(JSON.stringify({
            type: 'jyoti_message',
            text: aiResponse
        }));
    }
}

async function getAIResponse(messages) {
    try {
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: messages,
            temperature: 0.8, // Higher temperature for more natural, varied responses
            max_tokens: 150, // Keep responses concise
            presence_penalty: 0.6, // Encourage variety
            frequency_penalty: 0.3 // Reduce repetition
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
    }
}

function extractCandidateData(conversation) {
    // Use AI to extract structured data from conversation
    const conversationText = conversation.messages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role === 'user' ? 'Candidate' : 'Jyoti'}: ${m.content}`)
        .join('\n');

    // Simple extraction logic (can be enhanced with AI)
    const data = conversation.candidateData;

    // Extract location
    const locationMatch = conversationText.match(/(?:location|area|rehte|rahte|hoon|me)\s+([A-Za-z\s]+)/i);
    if (locationMatch && !data.location) {
        data.location = locationMatch[1].trim();
    }

    // Extract job preference
    if (conversationText.toLowerCase().includes('restaurant') && !data.jobPreference) {
        data.jobPreference = 'Restaurant';
    } else if (conversationText.toLowerCase().includes('retail') && !data.jobPreference) {
        data.jobPreference = 'Retail';
    } else if (conversationText.toLowerCase().includes('warehouse') && !data.jobPreference) {
        data.jobPreference = 'Warehouse';
    }

    // Extract salary expectation
    const salaryMatch = conversationText.match(/(\d{4,6})/);
    if (salaryMatch && !data.salaryExpectation) {
        data.salaryExpectation = salaryMatch[1];
    }

    // Extract experience
    if ((conversationText.toLowerCase().includes('experience') || conversationText.toLowerCase().includes('kaam kiya')) && !data.experience) {
        data.experience = 'Yes';
    }
}

function isInterviewComplete(candidateData) {
    // Check if we have minimum required information
    return candidateData.location &&
        candidateData.jobPreference;
}

function shouldEndInterview(candidateText) {
    const negativeKeywords = ['nahi', 'busy', 'baad me', 'interested nahi', 'time nahi'];
    return negativeKeywords.some(keyword => candidateText.toLowerCase().includes(keyword));
}

function handleEndInterview(conversationId) {
    conversations.delete(conversationId);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Jyoti AI Interview Assistant is running' });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Jyoti AI Interview Assistant running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server ready for connections`);

    if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️  WARNING: OPENAI_API_KEY not set. Please create .env file with your API key.');
    }
});
