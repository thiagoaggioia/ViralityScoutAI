const { google } = require('googleapis');
const { videos } = google.youtube('v3');

exports.handler = async (event, context) => {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;

        // Extrai os parâmetros da requisição
        // event.queryStringParameters contém os parâmetros da URL
        const query = event.queryStringParameters.q || 'tendências'; // Tema da busca (padrão: 'tendências')
        const maxResults = parseInt(event.queryStringParameters.maxResults) || 30; // Número de vídeos (padrão: 30)

        // Limita o maxResults para não estourar a cota da API (YouTube permite no máximo 50 por requisição)
        const finalMaxResults = Math.min(maxResults, 50);

        // Faz a requisição à API do YouTube
        const response = await videos.list({
            key: apiKey,
            part: 'snippet,statistics',
            q: query, // Usamos 'q' para buscar por termo
            type: 'video', // Garante que só buscaremos vídeos
            regionCode: 'BR', // Continua buscando no Brasil
            maxResults: finalMaxResults,
            order: 'viewCount', // Ordena por visualizações para encontrar os mais populares do tema
        });

        const videosAnalyzed = response.data.items.map(video => {
            const visualizacoes = parseInt(video.statistics.viewCount) || 0;
            const curtidas = parseInt(video.statistics.likeCount) || 0;
            const comentarios = parseInt(video.statistics.commentCount) || 0;

            // Lógica de cálculo da pontuação de viralidade (mantida)
            const score = (curtidas * 2 + comentarios) * Math.log10(visualizacoes + 1);

            return {
                titulo: video.snippet.title,
                url: `https://www.youtube.com/watch?v=${video.id}`,
                visualizacoes: visualizacoes,
                curtidas: curtidas,
                comentarios: comentarios,
                score: parseFloat(score.toFixed(2)),
                thumbnail: video.snippet.thumbnails.high.url // Adiciona a thumbnail do vídeo
            };
        });

        return {
            statusCode: 200,
            body: JSON.stringify(videosAnalyzed),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
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
