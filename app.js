require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:

const app = express();

const SpotifyWebApi = require('spotify-web-api-node');
const { get } = require('spotify-web-api-node/src/http-manager');

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:

app.get('/', (req, res) => {
    res.render('index', { title: 'Home', class: 'page-home' })
})

app.get('/artist-search', (req, res) => {
    const { artist } = req.query
    spotifyApi
        .searchArtists(artist)
        .then(data => {
            res.render('artist-search-results', { query: artist, foundArtist: data.body.artists.items, title: "Search results", class: 'page-search-results' })
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));

})

app.get('/albums/:id', (req, res) => {
    const { id } = req.params
    spotifyApi
        .getArtistAlbums(id)
        .then((data) => {
            const artist = data.body.items[0].artists[0].name
            res.render('albums', { artist, albums: data.body.items, title: "Albums", class: 'page-search-results' })
        })
        .catch(err => console.error(err))
})

app.get('/album/tracks/:id', (req, res) => {
    const { id } = req.params
    spotifyApi.getAlbumTracks(id)
        .then(async (data) => {
            const album = await spotifyApi.getAlbum(id)
            const artist = data.body.items[0].artists[0].name
            res.render('tracks', { artist, album: album.body.name, tracks: data.body.items, title: "Tracks", class: 'page-search-results' })
        })
        .catch(err => console.error(err))
})

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
