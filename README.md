# L’Écume des falaises

Site web responsive de la radio de la côte d’Albâtre, développé avec React, TypeScript et Vite.

## Fonctionnalités

- Lecteur de streaming persistant : lecture/pause, volume, sourdine et partage
- Grille des programmes par jour
- Catalogue de podcasts avec recherche, catégories et pré-écoute
- Espace annonceurs : offres, simulateur de campagne et formulaire de demande de devis
- Navigation mobile et mise en page adaptative

## Lancer le projet

```bash
npm install
npm run dev
```

Le serveur est accessible sur `http://localhost:5173`.

## Configurer le flux de la radio

Copiez `.env.example` vers `.env`, puis remplacez l’URL par le flux MP3/AAC Icecast ou Shoutcast de la station :

```env
VITE_RADIO_STREAM_URL=https://votre-serveur-radio.fr/direct.mp3
```

Sans configuration, le lecteur utilise un flux public de démonstration. Pour la production, le serveur de streaming doit autoriser les requêtes HTTPS depuis le domaine du site.

## Compiler pour la production

```bash
npm run build
npm run preview
```

Les fichiers optimisés sont générés dans `dist/`.

## Crédits visuels

Photographies de démonstration issues de Pexels : falaises d’Étretat et studio radio. Elles peuvent être remplacées dans `public/images/`.
