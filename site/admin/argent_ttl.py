import tkinter as tk
from tkinter import font
import requests

# ------------------------
# CONFIG
# ------------------------
API_KEY = "fe5ac021b0565b3de4e0a09bf2542ea1"
START_DATE = "2026-01-01"
FINISH_DATE = "2026-01-18"

HEADERS = {"X-API-Key": API_KEY}

# ------------------------
# FONCTIONS
# ------------------------
def get_domain_ids():
    """Récupère la liste des IDs de domaines pour le compte."""
    url = "https://api3.adsterratools.com/publisher/domains.json"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    data = response.json()
    ids = [item["id"] for item in data.get("items", [])]
    return ids

def get_total_revenue():
    total = 0
    try:
        domain_ids = get_domain_ids()
        for domain_id in domain_ids:
            url = f"https://api3.adsterratools.com/publisher/stats.json?domain={domain_id}&start_date={START_DATE}&finish_date={FINISH_DATE}&group_by=domain"
            response = requests.get(url, headers=HEADERS)
            response.raise_for_status()
            data = response.json()
            for item in data.get("items", []):
                total += float(item.get("revenue", 0))
    except Exception as e:
        print(f"Erreur : {e}")
    return total

# ------------------------
# TKINTER - UI MINIMALISTE
# ------------------------
root = tk.Tk()
root.title("Adsterra Revenue")
root.configure(bg="#FFFFFF")
root.geometry("800x600")

# Polices épurées
revenue_font = font.Font(family="Arial", size=96, weight="bold")
label_font = font.Font(family="Arial", size=13)
button_font = font.Font(family="Arial", size=11)

# Container principal centré
main_frame = tk.Frame(root, bg="#FFFFFF")
main_frame.place(relx=0.5, rely=0.5, anchor="center")

# Label période en haut
label_period = tk.Label(main_frame, text=f"{START_DATE} — {FINISH_DATE}", 
                        font=label_font, fg="#9CA3AF", bg="#FFFFFF")
label_period.pack(pady=(0, 30))

# Montant principal
label_total = tk.Label(main_frame, text="—", font=revenue_font, 
                       fg="#111827", bg="#FFFFFF")
label_total.pack(pady=20)

# Status discret
label_status = tk.Label(main_frame, text="", font=label_font, 
                        fg="#6B7280", bg="#FFFFFF")
label_status.pack(pady=(10, 40))

def refresh():
    label_status.config(text="Actualisation...", fg="#9CA3AF")
    button_refresh.config(state="disabled", fg="#D1D5DB")
    root.update()
    total = get_total_revenue()
    label_total.config(text=f"${total:.3f}")
    label_status.config(text="Mis à jour", fg="#10B981")
    button_refresh.config(state="normal", fg="#111827")

# Bouton minimaliste
button_refresh = tk.Button(main_frame, text="Actualiser", command=refresh, 
                           bg="#FFFFFF", fg="#111827", font=button_font,
                           relief="solid", bd=1, cursor="hand2",
                           padx=40, pady=12,
                           activebackground="#F3F4F6", activeforeground="#111827")
button_refresh.pack()

def on_enter(e):
    if button_refresh['state'] == 'normal':
        button_refresh['bg'] = '#F9FAFB'

def on_leave(e):
    if button_refresh['state'] == 'normal':
        button_refresh['bg'] = '#FFFFFF'

button_refresh.bind("<Enter>", on_enter)
button_refresh.bind("<Leave>", on_leave)

refresh()
root.mainloop()