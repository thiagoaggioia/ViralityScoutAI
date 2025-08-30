const { google } = require('googleapis');

exports.handler = async (event, context) => {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const youtube = google.youtube({
            version: 'v3',
            auth: apiKey
        });

        // Extrai os parâmetros da requisição
        const query = event.queryStringParameters.q || 'tecnologia';
        const maxResults = parseInt(event.queryStringParameters.maxResults) || 30;
        const finalMaxResults = Math.min(maxResults, 50);

        // --- PASSO 1: Busca os vídeos por tema usando 'search.list' ---
        const searchResponse = await youtube.search.list({
            q: query,
            part: 'snippet',
            type: 'video',
            regionCode: 'BR',
            maxResults: finalMaxResults,
            order: 'viewCount'
        });

        const videoIds = searchResponse.data.items.map(item => item.id.videoId);

        if (videoIds.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify([]),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        // --- PASSO 2: Obtém as estatísticas para cada vídeo usando 'videos.list' ---
        const videosResponse = await youtube.videos.list({
            part: 'snippet,statistics',
            id: videoIds.join(','),
        });

        const videosAnalyzed = videosResponse.data.items.map(video => {
            const visualizacoes = parseInt(video.statistics.viewCount) || 0;
            const curtidas = parseInt(video.statistics.likeCount) || 0;
            const comentarios = parseInt(video.statistics.commentCount) || 0;

            const score = (curtidas * 2 + comentarios) * Math.log10(visualizacoes + 1);

            return {
                titulo: video.snippet.title,
                url: `https://www.youtube.com/watch?v=${video.id}`,
                visualizacoes: visualizacoes,
                curtidas: curtidas,
                comentarios: comentarios,
                score: parseFloat(score.toFixed(2)),
                thumbnail: video.snippet.thumbnails.high.url
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
            body: JSON.stringify({ error: `Falha ao buscar as tendências do YouTube. Erro: ${error.message}` }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
