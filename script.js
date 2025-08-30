document.addEventListener("DOMContentLoaded", () => {
    const videosContainer = document.getElementById("videos-container");

    fetch("/.netlify/functions/get-trends")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            videosContainer.innerHTML = ''; // Limpa os placeholders
            if (data.length === 0) {
                videosContainer.innerHTML = '<p class="no-data">Nenhuma tendência encontrada no momento. Verifique novamente mais tarde!</p>';
                return;
            }

            // Ordena os vídeos pela pontuação de viralidade (maior primeiro)
            data.sort((a, b) => b.score - a.score);

            data.forEach(video => {
                const card = document.createElement("div");
                card.classList.add("video-card");
                
                card.innerHTML = `
                    <h3>${video.titulo}</h3>
                    <p><strong>Visualizações:</strong> ${video.visualizacoes.toLocaleString('pt-BR')}</p>
                    <p><strong>Curtidas:</strong> ${video.curtidas.toLocaleString('pt-BR')}</p>
                    <p><strong>Comentários:</strong> ${video.comentarios.toLocaleString('pt-BR')}</p>
                    <a href="${video.url}" target="_blank" rel="noopener noreferrer">Assistir no YouTube</a>
                `;
                videosContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar ou processar os dados:", error);
            videosContainer.innerHTML = '<p class="error-message">Não foi possível carregar as tendências. Tente novamente mais tarde.</p>';
        });
});

