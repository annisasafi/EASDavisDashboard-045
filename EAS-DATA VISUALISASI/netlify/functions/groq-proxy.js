// netlify/functions/groq-proxy.js
// Proxy aman ke Groq API. API key disimpan di Environment Variable Netlify
// (GROQ_API_KEY), TIDAK PERNAH dikirim ke browser / tersimpan di repo.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: { message: "GROQ_API_KEY belum diset di Netlify Environment Variables" },
      }),
    };
  }

  try {
    const { messages, max_tokens, model } = JSON.parse(event.body || "{}");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages,
        max_tokens: max_tokens || 600,
      }),
    });

    const data = await res.json();

    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: err.message } }),
    };
  }
};
