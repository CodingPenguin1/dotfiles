"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MusicMetrics {
    increment(metrics) {
        this.acousticness = this.incrementVals(this.acousticness, metrics.acousticness);
        this.danceability = this.incrementVals(this.danceability, metrics.danceability);
        this.energy = this.incrementVals(this.energy, metrics.energy);
        this.instrumentalness = this.incrementVals(this.instrumentalness, metrics.instrumentalness);
        this.liveness = this.incrementVals(this.liveness, metrics.liveness);
        this.loudness = this.incrementVals(this.loudness, metrics.loudness);
        this.speechiness = this.incrementVals(this.speechiness, metrics.speechiness);
        this.tempo = this.incrementVals(this.tempo, metrics.tempo);
        this.valence = this.incrementVals(this.valence, metrics.valence);
    }
    incrementVals(thisVal, thatVal) {
        thisVal = thisVal !== null && thisVal !== void 0 ? thisVal : 0;
        thatVal = thatVal !== null && thatVal !== void 0 ? thatVal : 0;
        return thisVal + thatVal;
    }
    setAverages(count) {
        this.acousticness = this.acousticness / count;
        this.danceability = this.danceability / count;
        this.energy = this.energy / count;
        this.instrumentalness = this.instrumentalness / count;
        this.liveness = this.liveness / count;
        this.loudness = this.loudness / count;
        this.speechiness = this.speechiness / count;
        this.tempo = this.tempo / count;
        this.valence = this.valence / count;
    }
}
exports.default = MusicMetrics;
//# sourceMappingURL=MusicMetrics.js.map