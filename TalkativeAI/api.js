const OPENAI_API_KEY = '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';
const GEMINI_API_KEY = 'AIzaSyDqQoUCqNrkn5ARQRAaiK9gvdN1C0h7Hu8';
const CLAUDE_API_KEY = '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'


async function sendToAI({ service, mode, systemPrompt, prompt, conversationHistory }) {
  if (!prompt) return '';

  if (mode === 'Image') {
    if (service === 'OpenAI') {
      return await generateImageOpenAI(prompt);
    } else if (service === 'Gemini') {
      return await generateImageGemini(prompt);
    } else {
      throw new Error(`${service} image generation is not supported in this app yet.`);
    }
  } else {
    if (service === 'Gemini') {
      return await callGemini(systemPrompt, conversationHistory);
    } else if (service === 'OpenAI') {
      return await callOpenAI(systemPrompt, conversationHistory);
    } else if (service === 'Claude') {
      return await callClaude(systemPrompt, conversationHistory);
    } else {
      throw new Error('Unknown service');
    }
  }
}

// ==========================
// IMAGE GENERATION - OPENAI
// ==========================

async function generateImageOpenAI(prompt) {
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        size: '1024x1024'
      })
    });

    const data = await res.json();
    console.log('OpenAI image response:', data);

    if (!res.ok) {
      throw new Error(`OpenAI HTTP ${res.status}: ${data?.error?.message || 'Unknown error'}`);
    }

    if (data?.data?.[0]?.b64_json) {
      return `data:image/png;base64,${data.data[0].b64_json}`;
    }

    if (data?.data?.[0]?.url) {
      return data.data[0].url;
    }

    throw new Error('No image data returned from OpenAI.');
  } catch (err) {
    throw new Error(`OpenAI Image Error: ${err.message}`);
  }
}

// ==========================
// IMAGE GENERATION - GEMINI
// ==========================

async function generateImageGemini(prompt) {
  try {
    const model = 'gemini-3.1-flash-image-preview';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseModalities: ['Image'],
        imageConfig: {
          aspectRatio: '1:1'
        }
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await res.json();
    console.log('Gemini image response:', data);

    if (!res.ok) {
      const msg = data?.error?.message || 'Unknown error';
      throw new Error(`Gemini HTTP ${res.status}: ${msg}`);
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      const snake = part.inline_data;
      if (snake?.data && snake?.mime_type) {
        return `data:${snake.mime_type};base64,${snake.data}`;
      }

      const camel = part.inlineData;
      if (camel?.data && camel?.mimeType) {
        return `data:${camel.mimeType};base64,${camel.data}`;
      }
      if (camel?.data && camel?.mime_type) {
        return `data:${camel.mime_type};base64,${camel.data}`;
      }
    }

    throw new Error(`No image data in Gemini response. Full response: ${JSON.stringify(data)}`);
  } catch (err) {
    throw new Error(`Gemini Image Error: ${err.message}`);
  }
}

// ==========================
// TEXT GENERATION - GEMINI
// ==========================

async function callGemini(systemPrompt, conversationHistory) {
  try {
    const model = 'gemini-2.5-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: []
    };

    if (systemPrompt && systemPrompt.trim() !== '') {
      requestBody.system_instruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    for (const msg of conversationHistory) {
      if (msg.isImage) continue;

      requestBody.contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await res.json();
    console.log('Gemini text response:', data);

    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}: ${data?.error?.message || 'Unknown error'}`);
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts
      .filter(part => typeof part.text === 'string')
      .map(part => part.text)
      .join('\n');

    return text || 'No response from Gemini.';
  } catch (err) {
    throw new Error(`Gemini Text Error: ${err.message}`);
  }
}

// ==========================
// TEXT GENERATION - OPENAI
// ==========================

async function callOpenAI(systemPrompt, conversationHistory) {
  try {
    const messages = [];

    if (systemPrompt && systemPrompt.trim() !== '') {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    for (const msg of conversationHistory) {
      if (msg.isImage) continue;

      messages.push({
        role: msg.role,
        content: msg.content
      });
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7
      })
    });

    const data = await res.json();
    console.log('OpenAI text response:', data);

    if (!res.ok) {
      throw new Error(`OpenAI HTTP ${res.status}: ${data?.error?.message || 'Unknown error'}`);
    }

    return data?.choices?.[0]?.message?.content || 'No response from OpenAI.';
  } catch (err) {
    throw new Error(`OpenAI Text Error: ${err.message}`);
  }
}

// ==========================
// TEXT GENERATION - CLAUDE
// ==========================

async function callClaude(systemPrompt, conversationHistory) {
  try {
    const { Anthropic } = await import('https://esm.sh/@anthropic-ai/sdk');

    const client = new Anthropic({
      apiKey: CLAUDE_API_KEY,
      dangerouslyAllowBrowser: true
    });

    const messages = [];

    for (const msg of conversationHistory) {
      if (msg.isImage) continue;

      messages.push({
        role: msg.role,
        content: msg.content
      });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      system: systemPrompt || '',
      messages,
      max_tokens: 1024
    });

    console.log('Claude response:', response);

    const text = (response.content || [])
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return text || 'No response from Claude.';
  } catch (err) {
    throw new Error(`Claude Text Error: ${err.message}`);
  }
}