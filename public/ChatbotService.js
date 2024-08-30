var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ChatbotService {
    constructor(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
    }
    answer(userMessage, history) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.apiBaseUrl}/api/ask`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: userMessage, history, format: "markdown" }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = yield response.json();
                if (data) {
                    return data;
                }
                else {
                    throw new Error("Invalid response from API");
                }
            }
            catch (error) {
                console.error("Error calling analyze API:", error);
                throw error;
            }
        });
    }
}
export default ChatbotService;
