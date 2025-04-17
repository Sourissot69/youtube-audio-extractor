const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint pour obtenir les informations sur la vidéo
app.post('/info', async (req, res) => {
  try {
    const videoURL = req.body.url;
    
    if (!ytdl.validateURL(videoURL)) {
      return res.status(400).json({ error: 'URL YouTube invalide' });
    }
    
    const info = await ytdl.getInfo(videoURL);
    const videoDetails = {
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      lengthSeconds: info.videoDetails.lengthSeconds,
      thumbnailUrl: info.videoDetails.thumbnails[0].url
    };
    
    res.json(videoDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération des informations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des informations' });
  }
});

// Endpoint pour télécharger l'audio
app.get('/download', async (req, res) => {
  try {
    const videoURL = req.query.url;
    
    if (!ytdl.validateURL(videoURL)) {
      return res.status(400).json({ error: 'URL YouTube invalide' });
    }
    
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    
    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');
    
    ytdl(videoURL, {
      quality: 'highestaudio',
      filter: 'audioonly',
    }).pipe(res);
    
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  
  // Créer le dossier public s'il n'existe pas
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
    console.log('Dossier public créé');
  }
});
