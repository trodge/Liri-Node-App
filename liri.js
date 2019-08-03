require('dotenv').config();
const keys = require('./keys.js');
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');

let liri = {
    'concert-this': function (artist) {
        axios.get('https://rest.bandsintown.com/artists/' + artist + '/events?app_id=codingbootcamp')
            .then(response => {
                for (let i = 0; i < response.data.length; ++i) {
                    let data = response.data[i];
                    let venue = data.venue;
                    this.write('Name of venue: ' + venue.name);
                    this.write('Location: ' + venue.city + ', ' + venue.region);
                    this.write('Date of event: ' + moment(data.datetime).format('MM/DD/YY'));
                }
            });
    },

    'spotify-this-song': function (song) {
        if (!song) song = 'The Sign Ace of Base';
        spotify.search({ type: 'track', query: song }, (err, data) => {
            if (err) return this.write('Error occurred: ' + err);
            let artistNames = new Set();
            let item = data.tracks.items[0];
            let artists = item.artists;
            let songName = item.name;
            let url = item.external_urls.spotify;
            let albumName = item.album.name;
            for (let j = 0; j < artists.length; ++j) {
                artistNames.add(artists[j].name);
            }
            this.write('Artists: ' + Array.from(artistNames).join(', '));
            this.write('Name: ' + songName);
            this.write('Preview link: ' + url);
            this.write('Album name: ' + albumName);
        });
    },

    'movie-this': function (movie) {
        if (!movie) movie = 'Mr. Nobody';
        axios.get('https://www.omdbapi.com/?t=' + movie + '&apikey=trilogy')
            .then(response => {
                let data = response.data;
                let items = ['Title', 'Year', 'Country', 'Language', 'Plot', 'Actors'];
                items.map(e => {
                    this.write(e + ': ' + data[e]);
                });
                data.Ratings.map(e => this.write(e.Source + ' Rating: ' + e.Value));
            });
    },

    'do-what-it-says': function () {
        fs.readFile('random.txt', 'utf8', (err, content) => this.runCommand(content));
    },

    runCommand: function (str) {
        let commaIndex = str.indexOf(',');
        let command, param;
        if (commaIndex > -1) {
            command = str.slice(0, commaIndex);
            param = str.slice(commaIndex + 1);
        } else command = str;
        this.write(str);
        this[command](param);
    },

    write: function (str) {
        console.log(str);
        fs.appendFile('log.txt', str + '\n', { encoding: 'utf8' }, () => {});
    }
};
liri.runCommand(process.argv.slice(2).join(','));
