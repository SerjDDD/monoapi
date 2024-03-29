const fs = require('fs');
const express = require('express');
const OpenAI = require('openai');

const MODEL = {
    GPT_3_5: 'gpt-3.5-turbo',
    GPT_3_5_0301: 'gpt-3.5-turbo-0301',
    GPT_3_5_0613: 'gpt-3.5-turbo-0613',
    GPT_3_5_1106: 'gpt-3.5-turbo-1106',
    GPT_3_5_16k: 'gpt-3.5-turbo-16k',
    GPT_3_5_16k_0613: 'gpt-3.5-turbo-16k-0613',
    GPT_3_5_instruct: 'gpt-3.5-turbo-instruct',
    GPT_3_5_instruct_0914: 'gpt-3.5-turbo-instruct-0914',
    GPT_4: 'gpt-4',
    GPT_4_0613: 'gpt-4-0613',
    GPT_4_1106_preview: 'gpt-4-1106-preview',
    GPT_4_vision_preview: 'gpt-4-vision-preview'
};

require('dotenv').config();

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const prompt = fs.readFileSync('./prompt.txt', 'utf8');

const handler = async (req, res) => {
    const payload = {
        method: req.method,
        endpoint: req.originalUrl,
        body: req.body
    };

    try {
        const chatCompletion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: JSON.stringify(payload) }
            ],
            model: MODEL.GPT_3_5,
        });

        const response = chatCompletion?.choices?.[0]?.message?.content;
        const jsonResponse = JSON.parse(response);

        console.log(JSON.stringify({ ...payload, response: jsonResponse }, null, 2));

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(jsonResponse, null, 2));
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
};

app.get('/favicon.ico', (req, res) => res.status(404).send());

app.get('*', handler);
app.post('*', handler);

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
