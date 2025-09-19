import psutil
import time
import os


def clear():
    # Efface l’écran du terminal
    os.system("clear")


while True:
    clear()
    print("=== Monitoring local (psutil) ===")

    # CPU
    cpu_percent = psutil.cpu_percent(interval=1)
    print(f"CPU : {cpu_percent}%")

    print(psutil.cpu_percent(interval=1, percpu=True))

    # RAM
    mem = psutil.virtual_memory()
    print(
        f"RAM : {mem.percent}% ({mem.used // (1024 ** 2)} MB utilisés sur {mem.total // (1024 ** 2)} MB)"
    )

    # Disque
    disk = psutil.disk_usage("/")
    print(
        f"Disque : {disk.percent}% ({disk.used // (1024 ** 3)} GB utilisés sur {disk.total // (1024 ** 3)} GB)"
    )

    # Top 5 processus CPU
    print("\nTop 5 processus par CPU :")
    processes = []
    for proc in psutil.process_iter(["pid", "name", "cpu_percent"]):
        processes.append(proc.info)
    top = sorted(processes, key=lambda p: p["cpu_percent"], reverse=True)[:5]
    for p in top:
        print(f"PID {p['pid']:>5} {p['name']:<25} CPU {p['cpu_percent']:>5.1f}%")

    time.sleep(2)
