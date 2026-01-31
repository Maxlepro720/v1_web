import os

# Fichier JS à inclure (relatif au HTML)
js_file = "../script/script_inspecter.js"

# Dossier à parcourir (le dossier du script)
root_folder = os.path.dirname(os.path.abspath(__file__))

# Fonction pour traiter un fichier HTML
def add_js_to_html(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Vérifie si le script est déjà présent
    if js_file in content:
        return

    # Ajoute la balise juste avant </body>
    content = content.replace("</body>", f'<script src="{js_file}"></script>\n</body>')

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

# Parcours récursif du dossier
for root, dirs, files in os.walk(root_folder):
    for file in files:
        if file.endswith(".html"):
            file_path = os.path.join(root, file)
            add_js_to_html(file_path)

print("Injection du script terminée ✅")
