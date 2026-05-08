const https = require("https");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const postJson = (url, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);

    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsedData = JSON.parse(data || "{}");
            if (res.statusCode >= 400) {
              return reject(
                new Error(parsedData.error?.message || `OpenRouter error: ${res.statusCode}`),
              );
            }
            resolve(parsedData);
          } catch (e) {
            reject(new Error("Invalid response received from OpenRouter"));
          }
        });
      },
    );

    req.on("error", (error) => reject(error));
    req.write(JSON.stringify(body));
    req.end();
  });
};

const createChatCompletion = async ({ apiKey, model, messages }) => {
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  return postJson(
    OPENROUTER_API_URL,
    {
      model: model || "openrouter/owl-alpha",
      messages,
    },
    {
      Authorization: `Bearer ${apiKey}`,
    },
  );
};

module.exports = {
  createChatCompletion,
};
