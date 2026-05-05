// AI-Powered Interview Manager with Real-time Conversation
class AIInterviewManager {
    constructor() {
        this.state = 'idle'; // idle, connecting, active, listening, ai_thinking, completed
        this.ws = null;
        this.candidateData = {};
        this.isInterviewActive = false;

        // Initialize speech recognition and synthesis
        this.initializeSpeech();
        this.initializeUI();
    }

    initializeSpeech() {
        // Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'hi-IN';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleCandidateResponse(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (this.isInterviewActive) {
                    this.updateStatus('सुनने में समस्या', 'कृपया फिर से बोलें');
                    this.setState('active');
                }
            };

            this.recognition.onend = () => {
                if (this.state === 'listening') {
                    this.setState('active');
                }
            };
        } else {
            console.warn('Speech recognition not supported');
        }

        // Speech Synthesis
        this.synthesis = window.speechSynthesis;
        this.voices = [];

        // Load voices
        const loadVoices = () => {
            this.voices = this.synthesis.getVoices();
            // Try to find Hindi voice (prefer female voice for Jyoti)
            this.hindiVoice = this.voices.find(voice =>
                voice.lang.startsWith('hi') && voice.name.toLowerCase().includes('female')
            ) || this.voices.find(voice => voice.lang.startsWith('hi')) || this.voices[0];
        };

        loadVoices();
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = loadVoices;
        }
    }

    initializeUI() {
        this.elements = {
            statusIndicator: document.getElementById('statusIndicator'),
            statusTitle: document.getElementById('statusTitle'),
            statusSubtitle: document.getElementById('statusSubtitle'),
            conversationScroll: document.getElementById('conversationScroll'),
            startBtn: document.getElementById('startBtn'),
            listenBtn: document.getElementById('listenBtn'),
            endBtn: document.getElementById('endBtn'),
            infoSummary: document.getElementById('infoSummary'),
            infoGrid: document.getElementById('infoGrid')
        };

        // Event listeners
        this.elements.startBtn.addEventListener('click', () => this.startInterview());
        this.elements.listenBtn.addEventListener('click', () => this.startListening());
        this.elements.endBtn.addEventListener('click', () => this.endInterview());
    }

    connectWebSocket() {
        return new Promise((resolve, reject) => {
            this.setState('connecting');
            this.updateStatus('कनेक्ट हो रहा है...', 'AI से जुड़ रहे हैं');

            // Connect to WebSocket server
            const wsUrl = 'ws://localhost:3000';
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('Connected to AI server');
                resolve();
            };

            this.ws.onmessage = (event) => {
                this.handleServerMessage(JSON.parse(event.data));
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateStatus('कनेक्शन एरर', 'सर्वर शुरू करें: npm start');
                this.setState('idle');
                reject(error);
            };

            this.ws.onclose = () => {
                console.log('Disconnected from AI server');
                if (this.isInterviewActive) {
                    this.updateStatus('कनेक्शन टूट गया', 'कृपया दोबारा शुरू करें');
                    this.setState('idle');
                    this.isInterviewActive = false;
                }
            };
        });
    }

    async handleServerMessage(data) {
        switch (data.type) {
            case 'jyoti_message':
                // AI's response received
                this.setState('active');
                await this.speak(data.text);
                // Auto-start listening for next response
                setTimeout(() => {
                    if (this.isInterviewActive && this.state === 'active') {
                        this.startListening();
                    }
                }, 500);
                break;

            case 'interview_complete':
                this.candidateData = data.candidateData;
                this.completeInterview();
                break;

            case 'interview_end':
                this.endInterview();
                break;

            case 'error':
                this.addMessage(data.message, 'jyoti');
                this.updateStatus('एरर', 'कृपया दोबारा प्रयास करें');
                this.setState('active');
                break;
        }
    }

    setState(newState) {
        this.state = newState;
        this.updateUI();
    }

    updateUI() {
        const { statusIndicator, startBtn, listenBtn, endBtn } = this.elements;

        // Update status indicator
        statusIndicator.className = 'status-indicator';
        listenBtn.classList.remove('listening');

        switch (this.state) {
            case 'idle':
                startBtn.disabled = false;
                listenBtn.disabled = true;
                endBtn.disabled = true;
                break;
            case 'connecting':
                startBtn.disabled = true;
                listenBtn.disabled = true;
                endBtn.disabled = true;
                break;
            case 'active':
                statusIndicator.classList.add('active');
                startBtn.disabled = true;
                listenBtn.disabled = false;
                endBtn.disabled = false;
                break;
            case 'listening':
                statusIndicator.classList.add('listening');
                startBtn.disabled = true;
                listenBtn.disabled = false;
                listenBtn.classList.add('listening');
                endBtn.disabled = false;
                break;
            case 'ai_thinking':
                statusIndicator.classList.add('active');
                startBtn.disabled = true;
                listenBtn.disabled = true;
                endBtn.disabled = false;
                break;
            case 'completed':
                startBtn.disabled = false;
                listenBtn.disabled = true;
                endBtn.disabled = true;
                break;
        }
    }

    updateStatus(title, subtitle) {
        this.elements.statusTitle.textContent = title;
        this.elements.statusSubtitle.textContent = subtitle;
    }

    addMessage(text, sender = 'jyoti') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const label = document.createElement('div');
        label.className = 'message-label';
        label.textContent = sender === 'jyoti' ? 'Jyoti' : 'उम्मीदवार';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = text;

        if (sender === 'jyoti') {
            messageDiv.appendChild(label);
        }
        messageDiv.appendChild(content);
        if (sender === 'candidate') {
            messageDiv.appendChild(label);
        }

        this.elements.conversationScroll.appendChild(messageDiv);

        // Auto scroll to bottom
        this.elements.conversationScroll.scrollTop = this.elements.conversationScroll.scrollHeight;
    }

    speak(text) {
        return new Promise((resolve) => {
            // Cancel any ongoing speech
            this.synthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'hi-IN';
            utterance.rate = 0.95; // Slightly slower for clarity
            utterance.pitch = 1.1; // Slightly higher pitch for female voice

            if (this.hindiVoice) {
                utterance.voice = this.hindiVoice;
            }

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();

            this.synthesis.speak(utterance);

            // Add message to conversation
            this.addMessage(text, 'jyoti');
        });
    }

    async startInterview() {
        try {
            // Clear previous conversation
            this.elements.conversationScroll.innerHTML = '';
            this.elements.infoSummary.style.display = 'none';
            this.candidateData = {};

            // Connect to AI server
            await this.connectWebSocket();

            this.isInterviewActive = true;
            this.setState('active');
            this.updateStatus('इंटरव्यू शुरू हो रहा है...', 'AI तैयार हो रहा है');

            // Send start signal to server
            this.ws.send(JSON.stringify({ type: 'start' }));

        } catch (error) {
            console.error('Failed to start interview:', error);
            alert('सर्वर से कनेक्ट नहीं हो पा रहा। कृपया सुनिश्चित करें कि आपने "npm start" चलाया है।');
            this.setState('idle');
        }
    }

    startListening() {
        if (!this.recognition) {
            alert('माफ़ करें, आपका ब्राउज़र वॉइस रिकग्निशन सपोर्ट नहीं करता। कृपया Chrome या Edge का उपयोग करें।');
            return;
        }

        this.setState('listening');
        this.updateStatus('सुन रहे हैं...', 'कृपया बोलें');

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Recognition start error:', error);
            // Recognition might already be running, just continue
        }
    }

    handleCandidateResponse(response) {
        this.setState('ai_thinking');
        this.updateStatus('AI सोच रहा है...', 'जवाब तैयार हो रहा है');

        // Add candidate message to UI
        this.addMessage(response, 'candidate');

        // Send to AI server
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'candidate_response',
                text: response
            }));
        }
    }

    completeInterview() {
        this.isInterviewActive = false;
        this.setState('completed');
        this.updateStatus('पूर्ण', 'इंटरव्यू सफलतापूर्वक समाप्त');

        // Show summary
        this.displaySummary();

        // Close WebSocket
        if (this.ws) {
            this.ws.close();
        }
    }

    displaySummary() {
        this.elements.infoGrid.innerHTML = '';

        const fields = [
            { label: 'स्थान', value: this.candidateData.location },
            { label: 'नौकरी प्राथमिकता', value: this.candidateData.jobPreference },
            { label: 'अनुभव', value: this.candidateData.experience },
            { label: 'वेतन अपेक्षा', value: this.candidateData.salaryExpectation }
        ];

        fields.forEach(field => {
            if (field.value) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'info-item';
                itemDiv.innerHTML = `
                    <div class="info-item-label">${field.label}</div>
                    <div class="info-item-value">${field.value}</div>
                `;
                this.elements.infoGrid.appendChild(itemDiv);
            }
        });

        if (Object.values(this.candidateData).some(v => v)) {
            this.elements.infoSummary.style.display = 'block';
        }
    }

    endInterview() {
        // Stop any ongoing speech
        this.synthesis.cancel();

        // Stop recognition if active
        if (this.recognition && this.state === 'listening') {
            try {
                this.recognition.stop();
            } catch (e) {
                // Ignore errors
            }
        }

        // Send end signal to server
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'end' }));
            this.ws.close();
        }

        this.isInterviewActive = false;
        this.setState('idle');
        this.updateStatus('तैयार', 'इंटरव्यू शुरू करने के लिए बटन दबाएं');
    }
}

// Initialize the application
let interviewManager;

document.addEventListener('DOMContentLoaded', () => {
    interviewManager = new AIInterviewManager();
});
