import axios from 'axios';
import { removeStopwords, eng, fra } from 'stopword'
import * as cheerio from 'cheerio';
import {Commodity} from "../types/Commodity";

class ScrappingService {

    /**
     * Récupère toutes les urls des pages concernant les vaisseaux
     * @returns {Promise<string[]>} - Retourne une promesse qui résout en une liste contenant les urls.
     */
    public async getShipsData(): Promise<string[]> {
        let textContents: string[] = [];

        try {
            const response = await axios.get("https://starcitizen.tools/Category:Ships");
            if (!response || !response.data) {
                throw new Error(`Réponse vide ou invalide pour l'URL https://starcitizen.tools/Category:Ships`);
            }

            const $ = cheerio.load(response.data);

            const $sections = $('[id="mw-pages"] a');

            let cleanText: string[] = [];
            $sections.each((index, element) => {
                cleanText.push('' + $(element).attr('href'));
            });

            textContents = cleanText;
        } catch (error) {
            console.error('Erreur lors de la récupération des données des vaisseaux:', error);
        }

        return textContents;
    }

    /**
     * Télécharge les pages web à partir d'une liste d'URLs, extrait et nettoie le texte de chaque section.
     * Supprime également "Ship profile" et tout ce qui suit dans le texte.
     * @param {string[]} urls - Liste des URLs à scraper.
     * @returns {Promise<string[]>} - Retourne une promesse qui résout en une liste de textes nettoyés pour chaque URL.
     */
    public async scrapeUrls(urls: string[]): Promise<string[]> {
        const textContents: string[] = await Promise.all(
            urls.map(async (url) => {
                try {
                    const response = await axios.get(`https://starcitizen.tools/rest.php/v1/page${url}/html`);
                    if (!response || !response.data) {
                        throw new Error(`Réponse vide ou invalide pour l'URL ${url}`);
                    }

                    const $ = cheerio.load(response.data);
                    $('style').remove();

                    // Extraction du texte
                    let extractedText = $('p, .infobox__item').text() || '';
                    const cutOffIndex = extractedText.indexOf('build3');
                    if (cutOffIndex !== -1) {
                        extractedText = extractedText.substring(0, cutOffIndex);
                    }

                    extractedText = extractedText.replace(/\s+/g, ' ').trim();
                    extractedText = extractedText.replace(/\n/g, ' ');
                    extractedText = extractedText.replace(/❤️/g, '');

                    const cleanText = removeStopwords(extractedText.split(' ')).join(' ');
                    return cleanText.replace(/<br\s*\/>/gi, '');
                } catch (error) {
                    console.error(`Erreur lors du scraping de l'URL ${url}`, error);
                    return '';
                }
            })
        );

        return textContents;
    }

    public async getMiningDesc(): Promise<string> {
        try {
            const response = await axios.get(`https://starcitizen.tools/rest.php/v1/page/Mining/html`);
            if (!response || !response.data) {
                throw new Error(`Réponse vide ou invalide`);
            }

            const $ = cheerio.load(response.data);
            $('style').remove();

            // Extraction du texte
            let extractedText = $.text() || '';

            extractedText = extractedText.replace(/\s+/g, ' ').trim();
            extractedText = extractedText.replace(/\n/g, ' ');
            extractedText = extractedText.replace(/❤️/g, '');

            const cleanText = removeStopwords(extractedText.split(' ')).join(' ');
            return cleanText.replace(/<br\s*\/>/gi, '');
        } catch (error) {
            console.error(`Erreur lors du scraping de l'URL`, error);
            return '';
        }
    }

    public async getcommodities(): Promise<Commodity[]> {
        const commodityMap: Map<string, Commodity> = new Map();

        const response = await axios.get(`https://uexcorp.space/api/2.0/commodities_prices_all`);
        if (response && response.data) {
            response.data.data.forEach((item: any) => {
                const commodityName = item.commodity_name;

                if (commodityMap.has(commodityName)) {
                    const existingCommodity = commodityMap.get(commodityName)!;

                    // Mise à jour des valeurs max pour price_buy_avg, price_sell_avg, et scu_sell_avg
                    existingCommodity.price_buy_avg = Math.max(existingCommodity.price_buy_avg, item.price_buy_avg);
                    existingCommodity.price_sell_avg = Math.max(existingCommodity.price_sell_avg, item.price_sell_avg);
                    existingCommodity.scu_sell_avg = Math.max(existingCommodity.scu_sell_avg, item.scu_sell_avg);
                } else {
                    // Si la commodity n'existe pas encore dans la Map, on l'ajoute
                    commodityMap.set(commodityName, {
                        commodity_name: item.commodity_name,
                        price_buy_avg: item.price_buy_avg,
                        price_sell_avg: item.price_sell_avg,
                        scu_sell_avg: item.scu_sell_avg
                    });
                }
            });
            return Array.from(commodityMap.values());
        } else {
            return [];
        }
    }

    public async getSalvageDesc(): Promise<string> {
        try {
            const response = await axios.get(`https://starcitizen.tools/rest.php/v1/page/Salvage/html`);
            if (!response || !response.data) {
                throw new Error(`Réponse vide ou invalide`);
            }

            const $ = cheerio.load(response.data);
            $('style').remove();

            // Extraction du texte
            let extractedText = $.text() || '';

            extractedText = extractedText.replace(/\s+/g, ' ').trim();
            extractedText = extractedText.replace(/\n/g, ' ');
            extractedText = extractedText.replace(/❤️/g, '');

            const cleanText = removeStopwords(extractedText.split(' ')).join(' ');
            return cleanText.replace(/<br\s*\/>/gi, '');
        } catch (error) {
            console.error(`Erreur lors du scraping de l'URL`, error);
            return '';
        }
    }

    public async getTradingDesc(): Promise<string> {
        try {
            const response = await axios.get(`https://starcitizen.tools/rest.php/v1/page/Trading/html`);
            if (!response || !response.data) {
                throw new Error(`Réponse vide ou invalide`);
            }

            const $ = cheerio.load(response.data);
            $('style').remove();

            // Extraction du texte
            let extractedText = $.text() || '';

            extractedText = extractedText.replace(/\s+/g, ' ').trim();
            extractedText = extractedText.replace(/\n/g, ' ');
            extractedText = extractedText.replace(/❤️/g, '');

            const cleanText = removeStopwords(extractedText.split(' ')).join(' ');
            return cleanText.replace(/<br\s*\/>/gi, '');
        } catch (error) {
            console.error(`Erreur lors du scraping de l'URL`, error);
            return '';
        }
    }

    public async getCareersDesc(): Promise<string> {
        try {
            const response = await axios.get(`https://starcitizen.tools/rest.php/v1/page/Careers/html`);
            if (!response || !response.data) {
                throw new Error(`Réponse vide ou invalide`);
            }

            const $ = cheerio.load(response.data);
            $('style').remove();

            // Extraction du texte
            let extractedText = $.text() || '';

            extractedText = extractedText.replace(/\s+/g, ' ').trim();
            extractedText = extractedText.replace(/\n/g, ' ');
            extractedText = extractedText.replace(/❤️/g, '');

            const cleanText = removeStopwords(extractedText.split(' ')).join(' ');
            return cleanText.replace(/<br\s*\/>/gi, '');
        } catch (error) {
            console.error(`Erreur lors du scraping de l'URL`, error);
            return '';
        }
    }
}

export default ScrappingService;
