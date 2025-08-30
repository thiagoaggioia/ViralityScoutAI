document.addEventListener("DOMContentLoaded", () => {
    const videosContainer = document.getElementById("videos-container");
    const searchInput = document.getElementById("searchInput");
    const maxResultsInput = document.getElementById("maxResultsInput");
    const searchButton = document.getElementById("searchButton");

    // Função para buscar e exibir os vídeos
    const fetchAndDisplayVideos = async (query = 'tecnologia', maxResults = 30) => {
        videosContainer.innerHTML = `
            <div class="video-card placeholder"><h3>Carregando ${query}...</h3><p>Preparando os vídeos mais virais!</p></div>
            <div class="video-card placeholder"><h3>Buscando mais...</h3><p>Isso pode levar alguns segundos.</p></div>
        `; // Mostra placeholders enquanto carrega

        try {
            // Constrói a URL com os parâmetros de busca
            const response = await fetch(`/.netlify/functions/get-trends?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);

            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }
            const data = await response.json();

            videosContainer.innerHTML = ''; // Limpa os placeholders
            if (data.length === 0) {
                videosContainer.innerHTML = '<p class="no-data">Nenhum vídeo encontrado para este tema. Tente outro!</p>';
                return;
            }

            // Ordena os vídeos pela pontuação de viralidade (maior primeiro)
            data.sort((a, b) => b.score - a.score);

            data.forEach(video => {
                const card = document.createElement("div");
                card.classList.add("video-card");
                
                card.innerHTML = `
                    ${video.thumbnail ? `<img src="${video.thumbnail}" alt="${video.titulo}" class="video-thumbnail">` : ''}
                    <h3>${video.titulo}</h3>
                    <p><strong>Visualizações:</strong> ${video.visualizacoes.toLocaleString('pt-BR')}</p>
                    <p><strong>Curtidas:</strong> ${video.curtidas.toLocaleString('pt-BR')}</p>
                    <p><strong>Comentários:</strong> ${video.comentarios.toLocaleString('pt-BR')}</p>
                    <a href="${video.url}" target="_blank" rel="noopener noreferrer">Assistir no YouTube</a>
                `;
                videosContainer.appendChild(card);
            });
        } catch (error) {
            console.error("Erro ao carregar ou processar os dados:", error);
            videosContainer.innerHTML = '<p class="error-message">Não foi possível carregar as tendências. Tente novamente mais tarde.</p>';
        }
    };

    // Event listeners para o botão de busca e a tecla Enter
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        const maxResults = maxResultsInput.value;
        if (query) { // Só busca se houver um termo
            fetchAndDisplayVideos(query, maxResults);
        } else {
            alert('Por favor, digite um tema para buscar!');
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click(); // Dispara o clique do botão quando Enter é pressionado
        }
    });
    maxResultsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    // Chama a função pela primeira vez ao carregar a página com um tema padrão
    fetchAndDisplayVideos();
});


