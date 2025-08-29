import os
import googleapiclient.discovery
import math
import json # Importe a biblioteca JSON

# Sua chave de API do YouTube
API_KEY = "AIzaSyBquvHt8h-NFsKXjzzqvizvhoN7dw3IQaU"

def get_youtube_client():
    """Cria um cliente para a API do YouTube."""
    try:
        os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
        return googleapiclient.discovery.build("youtube", "v3", developerKey=API_KEY)
    except Exception as e:
        print(f"Erro ao conectar à API do YouTube: {e}")
        return None

def calcular_score_viralidade(visualizacoes, curtidas, comentarios):
    """
    Calcula uma pontuação de viralidade simples.
    """
    try:
        if visualizacoes == 0:
            return 0
        
        engajamento = (curtidas * 2) + comentarios
        volume_suavizado = math.log10(visualizacoes + 1)
        score = engajamento * volume_suavizado
        return score
    except Exception as e:
        print(f"Erro ao calcular a pontuação: {e}")
        return 0

def monitorar_videos_em_alta(youtube):
    """Busca os vídeos em alta, calcula a pontuação e salva em um arquivo."""
    
    print("Buscando vídeos em alta do YouTube...")
    
    try:
        request = youtube.videos().list(
            part="snippet,statistics",
            chart="mostPopular",
            regionCode="BR",
            maxResults=25
        )
        response = request.execute()
        
        videos_analisados = [] # Lista para armazenar os dados

        for video in response["items"]:
            # Extrai os dados
            titulo = video["snippet"]["title"]
            id_video = video["id"]
            estatisticas = video["statistics"]
            
            visualizacoes = int(estatisticas.get("viewCount", 0))
            curtidas = int(estatisticas.get("likeCount", 0))
            comentarios = int(estatisticas.get("commentCount", 0))
            
            score_viralidade = calcular_score_viralidade(visualizacoes, curtidas, comentarios)
            
            # Adiciona os dados à lista
            videos_analisados.append({
                "titulo": titulo,
                "url": f"https://www.youtube.com/watch?v={id_video}",
                "visualizacoes": visualizacoes,
                "curtidas": curtidas,
                "comentarios": comentarios,
                "score": round(score_viralidade, 2)
            })

        # Salva a lista em um arquivo JSON
        with open("tendencias.json", "w", encoding="utf-8") as f:
            json.dump(videos_analisados, f, ensure_ascii=False, indent=4)
        
        print("Dados salvos em tendencias.json com sucesso!")
        
    except googleapiclient.errors.HttpError as e:
        print(f"Erro na requisição à API: {e}")