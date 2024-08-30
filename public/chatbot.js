var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ChatbotService from './ChatbotService.js';
// @ts-ignore
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
document.addEventListener("DOMContentLoaded", function () {
    const chatbotService = new ChatbotService('http://localhost:3000');
    // Variable pour conserver l'historique de la conversation
    const conversationHistory = [];
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');
    // Créer un élément de chargement
    function createLoadingElement() {
        const loadingElement = document.createElement('li');
        loadingElement.id = 'loading';
        loadingElement.innerHTML = 'Typing<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        return loadingElement;
    }
    form.addEventListener('submit', function (e) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            if (input.value) {
                const userMessage = input.value;
                // Ajouter le message de l'utilisateur à l'historique
                conversationHistory.push({ role: 'user', content: userMessage });
                // Afficher le message de l'utilisateur
                const userItem = document.createElement('li');
                userItem.textContent = userMessage;
                userItem.classList.add('user');
                messages.appendChild(userItem);
                // Ajouter l'élément de chargement
                const loadingElement = createLoadingElement();
                messages.appendChild(loadingElement);
                window.scrollTo(0, document.body.scrollHeight);
                try {
                    // Envoyer le message à l'API chatbot via ChatbotService
                    const botResponse = yield chatbotService.answer(userMessage, conversationHistory);
                    // Supprimer l'élément de chargement si présent
                    if (messages.contains(loadingElement)) {
                        messages.removeChild(loadingElement);
                    }
                    // Convertir la réponse du bot en HTML via Markdown
                    const markdownResponse = marked(botResponse); // marked() retourne directement une chaîne de caractères
                    // Afficher la réponse du bot avec le Markdown interprété
                    const botItem = document.createElement('li');
                    if (typeof markdownResponse === "string") {
                        botItem.innerHTML = markdownResponse;
                    }
                    botItem.classList.add('bot');
                    messages.appendChild(botItem);
                }
                catch (error) {
                    // Supprimer l'élément de chargement si présent
                    if (messages.contains(loadingElement)) {
                        messages.removeChild(loadingElement);
                    }
                    // Afficher un message d'erreur si la requête échoue
                    const errorItem = document.createElement('li');
                    errorItem.textContent = 'Sorry, an error occurred.';
                    errorItem.classList.add('bot');
                    messages.appendChild(errorItem);
                }
                window.scrollTo(0, document.body.scrollHeight);
                input.value = '';
                input.style.height = 'auto'; // Reset height after message is sent
            }
        });
    });
});
