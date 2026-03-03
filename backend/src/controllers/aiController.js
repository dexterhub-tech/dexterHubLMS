const { OpenAI } = require('openai');

let openai;

const getAIClient = () => {
    if (!openai) {
        // Use Mistral AI as primary if key is provided
        const mistralKey = process.env.MISTRAL_API_KEY;
        const openAIKey = process.env.OPENAI_API_KEY;

        if (mistralKey && mistralKey !== 'your_mistral_api_key_here') {
            openai = new OpenAI({
                apiKey: mistralKey,
                baseURL: 'https://api.mistral.ai/v1',
            });
            console.log('🤖 Using Mistral AI for quiz generation');
        } else {
            if (!openAIKey) {
                throw new Error('No AI API key found. Please provide MISTRAL_API_KEY or OPENAI_API_KEY in the backend/.env file.');
            }

            // Fallback/Legacy OpenAI/Gateway logic
            let baseURL = process.env.VERCEL_AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1';

            // Safeguard: Ensure /v1 is the suffix for ai-gateway.vercel.sh
            if (baseURL.includes('ai-gateway.vercel.sh') && !baseURL.endsWith('/v1')) {
                baseURL = baseURL.replace(/\/$/, '') + '/v1';
            }

            openai = new OpenAI({
                apiKey: openAIKey,
                baseURL: baseURL,
            });
            console.log('🤖 Using OpenAI/Gateway for quiz generation');
        }
    }
    return openai;
};

exports.generateQuiz = async (req, res) => {
    try {
        const client = getAIClient();
        const { title, difficulty } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Course/Session title is required' });
        }

        const prompt = `
      Create a highly engaging and educational quiz for a course session titled "${title}".
      Difficulty Level: ${difficulty || 'medium'}.

      Requirements:
      1. Generate exactly 10 questions based strictly on the topic: "${title}".
      2. Each question must have exactly 4 options.
      3. Specify the index (0-3) of the correct answer.
      4. Ensure the content is accurate and fits the difficulty level.
      5. Return the response as a valid JSON array of objects.

      JSON Format Example:
      [
        {
          "question": "What is the capital of France?",
          "options": ["London", "Berlin", "Paris", "Madrid"],
          "correctAnswer": 2
        }
      ]

      Return ONLY the JSON array. Do not include any other text or markdown formatting.
    `;

        // Use mistral-large-latest for Mistral, or gpt-4o as fallback
        const model = process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY !== 'your_mistral_api_key_here'
            ? "mistral-large-latest"
            : "gpt-4o";

        const response = await client.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: "You are an expert curriculum designer and quiz architect. You always respond with pure JSON." },
                { role: "user", content: prompt }
            ]
        });

        let quizData;
        try {
            let content = response.choices[0].message.content.trim();

            // Hyper-robust parsing: Find the first '[' and last ']'
            const firstBracket = content.indexOf('[');
            const lastBracket = content.lastIndexOf(']');

            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                content = content.substring(firstBracket, lastBracket + 1);
            }

            const parsed = JSON.parse(content);
            quizData = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.quiz || []);
        } catch (e) {
            console.error("Failed to parse AI response. Raw content:", response.choices[0].message.content);
            throw new Error("Invalid AI response format");
        }

        if (!Array.isArray(quizData) || quizData.length === 0) {
            throw new Error("AI failed to generate quiz questions");
        }

        res.json(quizData.slice(0, 10)); // Ensure max 10
    } catch (error) {
        console.error('AI Quiz Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate quiz with AI' });
    }
};
