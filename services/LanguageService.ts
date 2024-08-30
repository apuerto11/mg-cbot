import {Extraction} from "../types/Extraction";
import OpenAI from "openai";
import {Commodity} from "../types/Commodity";
import ChatCompletionMessageParam = OpenAI.ChatCompletionMessageParam;

class LanguageService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI();
    }

    public async extract(message: string): Promise<Extraction> {
        const systemMessage = `Tu es un assistant qui extrait les intentions d’un texte donné ainsi que les mot clés et les entités. Tu classifie aussi le texte a partir d'une liste de catégorie. Ta réponse doit être un JSON avec un objet "intents" qui contient la liste des intentions, un objet "keywords" qui contient les mots clés, un objet "entities" qui contient les entités du texte et un object "category" qui contient la catégorie représente le texte. par exemple : {"intents": ["météo du jour", "recommandation vestimentaire"], "keywords": ["météo", "recommandation", "vestimentaire"], "entities": ["Lyon", "météo"], "category": "météo"}`;
        const userMessage = `Extrait les intentions, les mots clés et les entités de ce texte: "${message}" et catégorise a partir de cette liste de catégories: minage (inclut aussi le raffinage), recyclage (ou salvage en anglais) transport (ou trading en anglais), recommandation de vaisseau (uniquement si l'utilisateur demande des informations techniques ou des recommandations sur un vaisseau). si aucune catégorie ne convient tu peut la laisser vide`;
        const response: string = await this.answer(systemMessage, userMessage);
        return JSON.parse(response.replace(/```json|```/g, '').trim()) as Extraction;
    }

    public async recommandShip(ships: string, intents: string, keywords: string, history: ChatCompletionMessageParam[], format?: "plain" | "markdown" | undefined): Promise<string> {
        const systemMessage = "Tu es un assistant qui vouvoie son interlocuteur et qui donne des recommandations objectives de vaisseau basé sur une liste de vaisseaux et leurs spécifications. Les recommandations que tu donnes doivent avoir une explication de ton choix brève et n'être basées QUE sur les informations qui te sont fournies. Les caractéristiques du vaisseau ne doivent pas apparaître. Tu ne dois pas mentionner que tu as une liste de vaisseaux. Entre chaque paragraphe saute une ligne.";
        const userMessage = `Voici la liste des vaisseau et leurs informations : ${ships}. Recommande un vaisseau en respéctant les intentions suivantes: "${intents}" et les mots clés suivants: "${keywords}".`;
        return await this.chat(systemMessage, userMessage, history, 0.7, "", format);
    }

    public async answerMining(miningDesc: string, commodities: Commodity[], message: string, history: ChatCompletionMessageParam[], format?: "plain" | "markdown" | undefined): Promise<string> {
        const stringCommodity: string = JSON.stringify(commodities);
        const systemMessage = "Tu est un assistant qui réponds au questions de son interlocuteur a propos des activités de minage dans le jeu Star Citizen. Pour ce faire tu t'aide des informations de minages et des données des ressources qui te sont fournies. Tu ne mentionne pas le fait que tu dispose de données et tu traduit les nom propre qui ne sont pas des inventions(comme 'Gold' qui devient 'Or' ou 'Laranite' qui ne change pas'). Il faut impérativement que les informations que tu donnes soient issues des données qui te sont fournies. Entre chaque paragraphe saute une ligne.";
        const userMessage = `Voici les informations: "${miningDesc}". Et voici la liste des ressources: ${stringCommodity}. Réponds au message suivant: "${message}".`;
        return await this.chat(systemMessage, userMessage, history, 0.7, "", format);
    }

    public async answerSalvage(salvageDesc: string, message: string, history: ChatCompletionMessageParam[], format?: "plain" | "markdown" | undefined): Promise<string> {
        const systemMessage = "Tu est un assistant qui réponds au questions de son interlocuteur a propos des activités de recyclage (ou salvage en anglais) dans le jeu Star Citizen. Pour ce faire tu t'aide des informations de recyclage qui te sont fournies. Tu ne mentionne pas le fait que tu dispose de données et tu traduit les nom propre qui ne sont pas des inventions(comme 'Gold' qui devient 'Or' ou 'Laranite' qui ne change pas'). Il faut impérativement que les informations que tu donnes soient issues des données qui te sont fournies. Entre chaque paragraphe saute une ligne.";
        const userMessage = `Voici les informations: "${salvageDesc}". Réponds au message suivant: "${message}".`;
        return await this.chat(systemMessage, userMessage, history, 0.7, "", format);
    }

    public async answerTrading(tradingDesc: string, commodities: Commodity[], message: string, history: ChatCompletionMessageParam[], format?: "plain" | "markdown" | undefined): Promise<string> {
        const stringCommodity: string = JSON.stringify(commodities);
        const systemMessage = "Tu est un assistant qui réponds au questions de son interlocuteur a propos des activités de transport de marchandises dans le jeu Star Citizen. Pour ce faire tu t'aide des informations de transport et des données des marchandises qui te sont fournies. Tu ne mentionne pas le fait que tu dispose de données et tu traduit les nom propre qui ne sont pas des inventions(comme 'Gold' qui devient 'Or' ou 'Laranite' qui ne change pas'). Il faut impérativement que les informations que tu donnes soient issues des données qui te sont fournies. Entre chaque paragraphe saute une ligne.";
        const userMessage = `Voici les informations: "${tradingDesc}". Et voici la liste des marchandises: ${stringCommodity}. Réponds au message suivant: "${message}".`;
        return await this.chat(systemMessage, userMessage, history, 0.7, "", format);
    }

    public async answerGeneral(careerDesc: string, commodities: Commodity[], message: string, history: ChatCompletionMessageParam[], format?: "plain" | "markdown" | undefined): Promise<string> {
        const stringCommodity: string = JSON.stringify(commodities);
        const systemMessage = "Tu est un assistant qui réponds au questions de son interlocuteur a propos du jeu Star Citizen. Pour ce faire tu t'aide des informations des activités et des données des marchandises/ressources qui te sont fournies. Tu ne mentionne pas le fait que tu dispose de données et tu traduit les nom propre qui ne sont pas des inventions(comme 'Gold' qui devient 'Or' ou 'Laranite' qui ne change pas'). Entre chaque paragraphe saute une ligne.";
        const userMessage = `Voici les informations: "${careerDesc}". Et voici la liste des marchandises: ${stringCommodity}. Réponds au message suivant: "${message}".`;
        return await this.chat(systemMessage, userMessage, history, 0.7, "", format);
    }

    private async answer(systemMessage: string, userMessage: string): Promise<string>;
    private async answer(systemMessage: string, userMessage: string, temperature: number): Promise<string>;
    private async answer(systemMessage: string, userMessage: string, temperature: number, model: string): Promise<string>;


    private async answer(systemMessage: string, userMessage: string, temperature?: number, model?: string): Promise<string> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: model ? model : "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: systemMessage
                    },
                    {
                        role: "user",
                        content: userMessage,
                    },
                ],
                temperature: temperature ? temperature : 0.7,
            });
            if (completion.choices[0].message.content) {
                return completion.choices[0].message.content;
            } else {
                throw new Error("No content returned from the API");
            }

        } catch (error) {
            console.error("Error extracting data from message:", error);
            throw error;
        }
    }

    private async chat(systemMessage: string, userMessage: string, history: ChatCompletionMessageParam[]): Promise<string>;
    private async chat(systemMessage: string, userMessage: string, history: ChatCompletionMessageParam[], temperature: number): Promise<string>;
    private async chat(systemMessage: string, userMessage: string, history: ChatCompletionMessageParam[], temperature: number, model: string): Promise<string>;
    private async chat(systemMessage: string, userMessage: string, history: ChatCompletionMessageParam[], temperature: number, model: string, format: "plain" | "markdown" | undefined): Promise<string>;

    private async chat(systemMessage: string, userMessage: string, history: ChatCompletionMessageParam[], temperature?: number, model?: string, format?: "plain" | "markdown" | undefined): Promise<string> {
        if (format == "markdown") {
            systemMessage += ` Réponds en markdown.`;
        }

        history.push({role: "system", content: systemMessage});
        history.push({role: "user", content: userMessage});

        try {
            const completion = await this.openai.chat.completions.create({
                model: model ? model : "gpt-4o-mini",
                messages: history,
                temperature: temperature ? temperature : 0.7,
            });
            if (completion.choices[0].message.content) {
                return completion.choices[0].message.content;
            } else {
                throw new Error("No content returned from the API");
            }
        } catch (error) {
            console.error("Error extracting data from message:", error);
            throw error;
        }
    }
}

export default LanguageService;
