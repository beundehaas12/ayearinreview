
// Mock the data since we are in a script without compilation
const models2025 = [
    { id: "deepseek-r1", url: "https://github.com/deepseek-ai" },
    { id: "qwen2-5", url: "https://github.com/QwenLM" },
    { id: "minimax-text-01", url: "#" },
    { id: "grok-3", url: "https://x.ai" },
    { id: "chatgpt-deep-research", url: "https://openai.com" },
    { id: "le-chat", url: "https://mistral.ai" },
    { id: "claude-3-7-sonnet", url: "https://anthropic.com" },
    { id: "yandexgpt-5-lite", url: "#" },
    { id: "gpt-4-5-orion", url: "https://openai.com" },
    { id: "phi-4-multimodal", url: "https://microsoft.com" },
    { id: "gemini-2-5", url: "https://deepmind.google" },
    { id: "yandexgpt-5-instruct", url: "#" },
    { id: "llama-4", url: "https://ai.meta.com" },
    { id: "openai-o3", url: "https://openai.com" },
    { id: "qwen-3", url: "https://github.com/QwenLM" },
    { id: "alphaevolve", url: "https://deepmind.google" },
    { id: "veo-3", url: "https://deepmind.google" },
    { id: "claude-4", url: "https://anthropic.com" },
    { id: "gpt-image-1", url: "https://openai.com" },
    { id: "flux-kontext", url: "#" },
    { id: "midjourney-v7", url: "https://midjourney.com" },
    { id: "gemma-3", url: "https://ai.google.dev" },
    { id: "imagen-4", url: "https://deepmind.google" },
    { id: "glm-4-5", url: "#" },
    { id: "gpt-oss", url: "https://openai.com" },
    { id: "claude-4-1-opus", url: "https://anthropic.com" },
    { id: "gpt-5", url: "https://openai.com" },
    { id: "deepseek-v3-1", url: "https://deepseek.com" },
    { id: "yandexgpt-5-1", url: "#" },
    { id: "apertus", url: "#" },
    { id: "claude-4-5-sonnet", url: "https://anthropic.com" },
    { id: "deepseek-v3-2-exp", url: "https://deepseek.com" },
    { id: "glm-4-6", url: "#" },
    { id: "minimax-m2", url: "#" },
    { id: "alice-ai-llm", url: "#" },
    { id: "gpt-5-1", url: "https://openai.com" },
    { id: "ernie-5-0", url: "#" },
    { id: "gemini-3-pro", url: "https://deepmind.google" },
    { id: "claude-opus-4-5", url: "https://anthropic.com" },
    { id: "mistral-3-1-small", url: "https://mistral.ai" },
    { id: "gpt-5-2", url: "https://openai.com" },
    { id: "grok-4-video", url: "https://x.ai" },
    { id: "sora-2", url: "https://openai.com" },
    { id: "midjourney-8", url: "https://midjourney.com" }
];

const checkUrls = async () => {
    console.log("Starting URL verification...");
    const results = {
        working: [],
        broken: [],
        placeholder: []
    };

    for (const model of models2025) {
        if (model.url === "#" || !model.url) {
            results.placeholder.push(model.id);
            continue;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(model.url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: { 'User-Agent': 'Mozilla/5.0' } // Fake UA to avoid some blocks
            });
            clearTimeout(timeoutId);

            if (response.ok || response.status === 405 || response.status === 403) {
                // 405/403 often means "I exist but don't like HEAD requests or bots", which is fine for "working"
                results.working.push({ id: model.id, url: model.url, status: response.status });
            } else {
                results.broken.push({ id: model.id, url: model.url, status: response.status });
            }
        } catch (error) {
            // Some sites completely block fetch/ping, might need manual check
            results.broken.push({ id: model.id, url: model.url, error: error.message });
        }
    }

    console.log("\n--- REPORT ---");
    console.log(`Working: ${results.working.length}`);
    console.log(`Placeholders (#): ${results.placeholder.length}`);
    console.log(`Broken/Unreachable: ${results.broken.length}`);

    if (results.placeholder.length > 0) {
        console.log("\nPlaceholder IDs:");
        console.log(results.placeholder.join(", "));
    }

    if (results.broken.length > 0) {
        console.log("\nBroken/Error IDs:");
        results.broken.forEach(b => console.log(`${b.id}: ${b.url} (${b.status || b.error})`));
    }
};

checkUrls();
