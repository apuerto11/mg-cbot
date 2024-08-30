import { Router, Request, Response } from 'express';
import {Extraction} from "../types/Extraction";
import LanguageService from "../services/LanguageService";
import ScrappingService from "../services/ScrappingService";
import OpenAI from "openai/index";
import ChatCompletionMessageParam = OpenAI.ChatCompletionMessageParam;

const languageService = new LanguageService();
const scrappingService = new ScrappingService();
const router = Router();

/**
 * @openapi
 * /api/ask:
 *   post:
 *     tags:
 *     - Analysis Controller
 *     summary: Analyse un message utilisateur pour extraire des informations et fournir une réponse adaptée.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - history
 *             properties:
 *               message:
 *                 type: string
 *                 description: Le message utilisateur à analyser.
 *                 example: "Je cherche un vaisseau pour faire du minage."
 *               history:
 *                 type: array
 *                 description: L'historique des messages précédents échangés avec l'utilisateur.
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [ "user", "assistant" ]
 *                       description: Le rôle de l'émetteur du message (utilisateur ou assistant).
 *                       example: "user"
 *                     content:
 *                       type: string
 *                       description: Le contenu du message.
 *                       example: "comment fonctionne le minage ?"
 *                 example: [
 *                   { "role": "user", "content": "comment fonctionne le minage ?" },
 *                   { "role": "assistant", "content": "Le minage est divisé en trois étapes..." }
 *                 ]
 *               format:
 *                 type: string
 *                 description: Le format de la réponse attendue (texte brut ou Markdown).
 *                 enum: [ "plain", "markdown" ]
 *                 example: "markdown"
 *     responses:
 *       200:
 *         description: Succès - Retourne une réponse adaptée basée sur l'analyse du message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: La réponse générée en fonction du message analysé et du format spécifié.
 *                   example: "Pour le minage, nous recommandons le vaisseau Prospector."
 *       400:
 *         description: Requête invalide - Les champs 'message' et 'history' sont requis.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Message field can't be empty"
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/', async (req: Request, res: Response) => {
    if (req.body.message){
        const message: string = req.body.message;
        const format: "plain" | "markdown" | undefined = req.body.format;
        const history: ChatCompletionMessageParam[] = req.body.history;
        const extraction: Extraction = await languageService.extract(message);

        switch (extraction.category) {
            case "minage":
                scrappingService.getMiningDesc().then(miningDesc => {
                    scrappingService.getcommodities().then(async commodities => {
                        res.json(await languageService.answerMining(miningDesc, commodities, message, history, format));
                    })
                })
                break;
            case "recyclage":
                scrappingService.getSalvageDesc().then(async salvageDesc => {
                    res.json(await languageService.answerSalvage(salvageDesc, message, history, format));
                })
                break;
            case "transport":
                scrappingService.getTradingDesc().then(async tradingDesc => {
                    scrappingService.getcommodities().then(async commodities => {
                        res.json(await languageService.answerTrading(tradingDesc, commodities, message, history, format));
                    })
                })
                break;
            case "recommandation de vaisseau":
                scrappingService.getShipsData().then(result => {
                    scrappingService.scrapeUrls(result).then(async r => {
                        const flatShips: string = r.join("\n");
                        res.json(await languageService.recommandShip(flatShips, extraction.intents.join(","), extraction.keywords.join(","), history, format));
                    });
                })
                break;
            default:
                scrappingService.getCareersDesc().then(async careerDesc => {
                    scrappingService.getcommodities().then(async commodities => {
                        res.json(await languageService.answerGeneral(careerDesc, commodities, message, history, format));
                    })
                })
        }
    } else {
        res.status(400);
        res.json("Message field can't be empty");
    }
})

export default router;
