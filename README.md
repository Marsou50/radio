# L’Écume des falaises

Webradio musicale de Granville, développée avec React, TypeScript et Vite. Le site utilise un thème sombre et un lecteur de direct unique : tous les auditeurs écoutent le même flux, sans podcasts ni lecture à la demande.

## Fonctionnalités

- Direct musical commun à tous les auditeurs, en continu
- Lecture/pause, volume, sourdine et partage
- Présentation des tranches musicales et des derniers titres diffusés
- Propositions de morceaux par les artistes
- Espace annonceurs avec simulateur et formulaire de demande
- Interface sombre, responsive et accessible

## Lancer le projet

```bash
npm install
npm run dev
```

Le serveur est accessible sur `http://localhost:5173`.

## Configurer le flux de la radio

Copiez `.env.example` vers `.env`, puis renseignez le flux HTTPS MP3/AAC Icecast ou Shoutcast de la station :

```env
VITE_RADIO_STREAM_URL=https://votre-serveur-radio.fr/direct.mp3
```

Sans configuration, le lecteur utilise un flux musical public de démonstration. Pour la production, utilisez votre propre flux HTTPS afin d’éviter le blocage du contenu mixte par les navigateurs. Un flux Icecast unique garantit que chaque auditeur rejoint la même programmation en cours ; un léger décalage de quelques secondes lié à la mise en mémoire tampon est normal.

## Compiler pour la production

```bash
npm run build
npm run preview
```

Les fichiers optimisés sont générés dans `dist/`.

## Déployer sur GitHub Pages

Le workflow `.github/workflows/deploy.yml` compile et publie automatiquement le site après chaque push sur la branche de travail ou `main`.

1. Ouvrir **Settings → Pages** dans le dépôt GitHub.
2. Dans **Build and deployment → Source**, choisir **GitHub Actions**.
3. Facultatif : dans **Settings → Secrets and variables → Actions → Variables**, créer `VITE_RADIO_STREAM_URL` avec l’URL HTTPS du flux de la station.
4. Lancer le workflow **Déployer la radio sur GitHub Pages** depuis l’onglet **Actions**, ou effectuer un push.
5. L’adresse publique sera `https://Marsou50.github.io/radio/`.

Pour un nom de domaine personnalisé, le renseigner dans **Settings → Pages → Custom domain**, puis configurer l’enregistrement DNS demandé par GitHub.

## Crédits visuels

Photographies de démonstration issues de Pexels : falaises d’Étretat et studio radio. Elles peuvent être remplacées dans `public/images/`.
