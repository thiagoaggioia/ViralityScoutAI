const { google } = require('googleapis');
const { videos } = google.youtube('v3');

exports.handler = async (event, context) => {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY; // Sua chave de API de forma segura
        
        // Faz a requisição à API do YouTube
        const response = await videos.list({
            key: apiKey,
            part: 'snippet,statistics',
            chart: 'mostPopular',
            regionCode: 'BR',
            maxResults: 25,
        });

        const videosAnalyzed = response.data.items.map(video => {
            const visualizacoes = parseInt(video.statistics.viewCount) || 0;
            const curtidas = parseInt(video.statistics.likeCount) || 0;
            const comentarios = parseInt(video.statistics.commentCount) || 0;

            // Lógica de cálculo da pontuação de viralidade (traduzida do Python)
            const score = (curtidas * 2 + comentarios) * Math.log10(visualizacoes + 1);

            return {
                titulo: video.snippet.title,
                url: `https://www.youtube.com/watch?v=${video.id}`,
                visualizacoes: visualizacoes,
                curtidas: curtidas,
                comentarios: comentarios,
                score: parseFloat(score.toFixed(2)),
            };
        });

        return {
            statusCode: 200,
            body: JSON.stringify(videosAnalyzed),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Permite que seu site acesse a função
            },
        };

    } catch (error) {
        console.error('Erro ao buscar ou processar dados:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Falha ao buscar as tendências do YouTube.' }),
        };
    }
};