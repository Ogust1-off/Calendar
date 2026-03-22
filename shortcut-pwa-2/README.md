# Shortcut™ — Agenda ECAM PWA
> © 2026 Ogust'1

## 📱 Comment installer sur iPhone (sans serveur)

### Étape 1 — Mettre en ligne sur GitHub Pages (GRATUIT)

1. Va sur **github.com** et crée un compte si tu n'en as pas
2. Clique **"New repository"** (bouton vert)
3. Nom du repo : `shortcut-agenda` (ou ce que tu veux)
4. Coche **"Public"** *(obligatoire pour GitHub Pages gratuit)*
5. Clique **"Create repository"**

### Étape 2 — Uploader les fichiers

Dans ton nouveau repo, clique **"uploading an existing file"** et glisse-dépose **tout le contenu** de ce dossier :
```
index.html
manifest.json
sw.js
Asset/
  CSS/
    styleagenda_b.css
  JS/
    agenda_b.js
  Picture/
    icon-32.png
    icon-120.png
    icon-152.png
    icon-180.png
    icon-192.png
    icon-512.png
    splash.png
```

Clique **"Commit changes"**.

### Étape 3 — Activer GitHub Pages

1. Dans ton repo → **Settings** → **Pages** (menu gauche)
2. Source : **"Deploy from a branch"**
3. Branch : **main** → dossier **/ (root)**
4. Clique **Save**
5. Attends 1-2 minutes → ton app sera dispo sur :
   `https://TON-USERNAME.github.io/shortcut-agenda/`

### Étape 4 — Installer sur iPhone

1. Ouvre **Safari** (obligatoire, pas Chrome)
2. Va sur ton URL GitHub Pages
3. Appuie sur le bouton **Partager** (⎙)
4. Appuie sur **"Sur l'écran d'accueil"**
5. Confirme → L'app apparaît comme une vraie app native ! 🎉

---

## 🔗 Partager avec des amis

Envoie juste le lien GitHub Pages. Ils suivent l'étape 4 sur leur iPhone !

---

## ⚙️ Modifier les clés API / calendriers

Ouvre `Asset/JS/agenda_b.js` et modifie les constantes en haut du fichier.

---

## 🔄 Mettre à jour l'app

Remplace les fichiers sur GitHub → les utilisateurs reçoivent la mise à jour automatiquement la prochaine fois qu'ils ouvrent l'app avec du réseau.
