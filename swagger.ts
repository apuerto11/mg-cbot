import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application, Request, Response } from 'express';

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'StarCitizen Chatbot API',
            description: "",
            contact: {
                name: "Andrea Puerto",
                email: "puertoandrea11@gmail.com"
            },
            version: '1.0.0',
        },
        servers: [
            {
                url: "http://localhost:3000/",
                description: "Local server"
            }
        ]
    },
    apis: ['./routes/*.ts'], // Si vous utilisez TypeScript, vous devrez peut-être ajuster ce chemin
}

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Application, port: string | number): void {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/docs.json', (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}

export default swaggerDocs;
