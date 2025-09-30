import asyncio
import json
import os
import psutil
import websockets
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

BACKEND_URL = os.getenv("BACKEND_URL", "ws://localhost:8002/api/ws/metrics/")
API_KEY = os.getenv("API_KEY")
INTERVAL = int(os.getenv("INTERVAL", 2))


async def handle_kill_process(pid):
    """Tente de tuer un processus par son PID."""
    try:
        p = psutil.Process(pid)
        p.terminate()  # Envoie SIGTERM (plus propre)
        logging.info(f"Tentative de terminaison du processus {pid}...")
        try:
            p.wait(timeout=3)
            logging.info(f"Processus {pid} terminé avec succès.")
            return {"status": "success", "pid": pid, "message": "Process terminated."}
        except psutil.TimeoutExpired:
            p.kill()  # Envoie SIGKILL (force)
            logging.warning(
                f"Le processus {pid} n'a pas répondu à SIGTERM, envoi de SIGKILL."
            )
            return {"status": "success", "pid": pid, "message": "Process killed."}
    except psutil.NoSuchProcess:
        logging.error(f"Processus {pid} non trouvé.")
        return {"status": "error", "pid": pid, "message": "Process not found."}
    except psutil.AccessDenied:
        logging.error(
            f"Accès refusé pour tuer le processus {pid}. L'agent doit être exécuté avec des privilèges suffisants."
        )
        return {"status": "error", "pid": pid, "message": "Access denied."}
    except Exception as e:
        logging.error(f"Erreur inattendue en tuant le processus {pid}: {e}")
        return {"status": "error", "pid": pid, "message": str(e)}


async def listen_for_commands(websocket):
    """Écoute en permanence les commandes venant du backend."""
    try:
        async for message in websocket:
            try:
                command = json.loads(message)
                logging.info(f"Commande reçue: {command}")
                if command.get("action") == "kill" and "pid" in command:
                    pid = command["pid"]
                    result = await handle_kill_process(pid)
                    # Renvoyer un accusé de réception au backend
                    await websocket.send(
                        json.dumps({"type": "kill_result", "data": result})
                    )
            except json.JSONDecodeError:
                logging.error("Erreur de décodage du message JSON.")
            except Exception as e:
                logging.error(f"Erreur lors du traitement de la commande: {e}")
    except websockets.exceptions.ConnectionClosed:
        logging.info("La connexion a été fermée, arrêt de l'écoute des commandes.")


async def send_metrics(websocket):
    """Envoie les métriques système à intervalles réguliers."""
    while True:
        try:
            # Collecte des métriques
            cpu_percent = psutil.cpu_percent(interval=1)
            mem = psutil.virtual_memory()
            disk = psutil.disk_usage("/")

            # Top 5 processus
            processes = []
            for proc in psutil.process_iter(
                ["pid", "name", "cpu_percent", "memory_percent"]
            ):
                try:
                    processes.append(proc.info)
                except (
                    psutil.NoSuchProcess,
                    psutil.AccessDenied,
                    psutil.ZombieProcess,
                ):
                    pass
            top_processes = sorted(
                processes, key=lambda p: p["cpu_percent"], reverse=True
            )[:10]

            data = {
                "type": "metrics",
                "data": {
                    "metrics": [
                        {"name": "CPU", "level": cpu_percent},
                        {"name": "RAM", "level": mem.percent},
                        {"name": "Disk", "level": disk.percent},
                    ],
                    "top_processes": top_processes,
                },
            }

            await websocket.send(json.dumps(data))
            logging.info(f"Métriques envoyées.")
        except websockets.exceptions.ConnectionClosed:
            logging.error("La connexion a été perdue. Arrêt de l'envoi des métriques.")
            break
        except Exception as e:
            logging.error(f"Erreur lors de l'envoi des métriques: {e}")

        await asyncio.sleep(INTERVAL)


async def main():
    """Fonction principale pour lancer l'agent."""
    if not API_KEY:
        logging.error("Erreur: La variable d'environnement API_KEY n'est pas définie.")
        return

    url = f"{BACKEND_URL.rstrip('/')}/{API_KEY}"

    while True:
        try:
            async with websockets.connect(url) as websocket:

                # Lancer les deux tâches en parallèle
                listen_task = asyncio.create_task(listen_for_commands(websocket))
                send_task = asyncio.create_task(send_metrics(websocket))

                done, pending = await asyncio.wait(
                    [listen_task, send_task],
                    return_when=asyncio.FIRST_COMPLETED,
                )

                for task in pending:
                    task.cancel()

        except (
            websockets.exceptions.InvalidURI,
            websockets.exceptions.InvalidHandshake,
            ConnectionRefusedError,
        ) as e:
            logging.error(
                f"Impossible de se connecter au backend: {e}. Nouvelle tentative dans {INTERVAL * 2} secondes."
            )
        except Exception as e:
            logging.error(
                f"Une erreur inattendue est survenue: {e}. Nouvelle tentative dans {INTERVAL * 2} secondes."
            )

        await asyncio.sleep(INTERVAL)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Agent arrêté manuellement.")
