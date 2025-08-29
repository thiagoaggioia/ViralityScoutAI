# main.py

import time
from youtube_scout import get_youtube_client, monitorar_videos_em_alta

def run_scout_continuously():
    """
    Função principal que executa o agente de monitoramento
    em um loop contínuo.
    """
    youtube_client = get_youtube_client()
    if not youtube_client:
        print("Não foi possível conectar à API do YouTube. Encerrando...")
        return

    print("--- Agente Virality Scout AI iniciado ---")
    
    try:
        while True:
            # Chama a função de monitoramento do YouTube
            monitorar_videos_em_alta(youtube_client)
            
            # Pausa a execução por 15 minutos (900 segundos) antes da próxima rodada
            print("\nAguardando 15 minutos para a próxima rodada de monitoramento...\n")
            time.sleep(900)
            
    except KeyboardInterrupt:
        print("\n--- Agente encerrado pelo usuário. ---")
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")

if __name__ == "__main__":
    run_scout_continuously()