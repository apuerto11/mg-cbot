import {message} from "./chatbot";

class ChatbotService {
    private apiBaseUrl: string;

    constructor(apiBaseUrl: string) {
        this.apiBaseUrl = apiBaseUrl;
    }

    public async answer(userMessage: string, history: message[]): Promise<string> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage, history, format: "markdown" }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data) {
                return data;
            } else {
                throw new Error("Invalid response from API");
            }
        } catch (error) {
            console.error("Error calling analyze API:", error);
            throw error;
        }
    }
}

export default ChatbotService;
