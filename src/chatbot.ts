import ChatbotService from './ChatbotService.js';
// @ts-ignore
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

export interface message {
    role: string;
    content: string;
}

document.addEventListener("DOMContentLoaded", function () {
    const chatbotService = new ChatbotService('http://localhost:3000');

    // Variable pour conserver l'historique de la conversation
    const conversationHistory: message[] = [];

    const form = document.getElementById('form') as HTMLFormElement;
    const input = document.getElementById('input') as HTMLTextAreaElement;
    const messages = document.getElementById('messages')!;

    // Créer un élément de chargement
    function createLoadingElement(): HTMLLIElement {
        const loadingElement = document.createElement('li');
        loadingElement.id = 'loading';
        loadingElement.innerHTML = 'Typing<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        return loadingElement;
    }

    form.addEventListener('submit', async function(e: Event) {
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
                const botResponse = await chatbotService.answer(userMessage, conversationHistory);

                // Supprimer l'élément de chargement si présent
                if (messages.contains(loadingElement)) {
                    messages.removeChild(loadingElement);
                }

                // Convertir la réponse du bot en HTML via Markdown
                const markdownResponse = marked(botResponse);  // marked() retourne directement une chaîne de caractères

                // Afficher la réponse du bot avec le Markdown interprété
                const botItem = document.createElement('li');
                if (typeof markdownResponse === "string") {
                    botItem.innerHTML = markdownResponse;
                }
                botItem.classList.add('bot');
                messages.appendChild(botItem);
            } catch (error) {
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
