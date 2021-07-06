"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MusicScatterMetric_1 = require("./MusicScatterMetric");
class MusicScatterData {
    constructor() {
        this.feature_keys = [
            "Acousticness",
            "Danceability",
            "Energy",
            "Instrumentalness",
            "Liveness",
            "Loudness",
            "Speechiness",
            "Tempo",
            "Valence",
        ];
        this.acousticness = [];
        this.accousticness_range = { min: 0.0, max: 1.0 };
        this.danceability = [];
        this.danceability_range = { min: 0.0, max: 1.0 };
        this.energy = [];
        this.energy_range = { min: 0.0, max: 1.0 };
        this.instrumentalness = [];
        this.instrumentalness_range = {};
        this.liveness = [];
        this.liveness_range = { min: 0.0, max: 1.0 };
        this.loudness = [];
        this.loudness_range = { min: -260, max: 200 };
        this.speechiness = [];
        this.speechiness_range = { min: 0.0, max: 1.0 };
        this.tempo = [];
        this.tempo_range = { min: 0.0, max: 200 };
        this.valence = [];
        this.valence_range = { min: 0.0, max: 1.0 };
    }
    addMetric(metrics) {
        this.addMetricByFeature(metrics, "loudness");
        this.addMetricByFeature(metrics, "valence");
        this.addMetricByFeature(metrics, "acousticness");
        this.addMetricByFeature(metrics, "danceability");
        this.addMetricByFeature(metrics, "energy");
        this.addMetricByFeature(metrics, "instrumentalness");
        this.addMetricByFeature(metrics, "liveness");
        this.addMetricByFeature(metrics, "speechiness");
        this.addMetricByFeature(metrics, "tempo");
    }
    addMetricByFeature(metrics, feature) {
        const scatterPoint = new MusicScatterMetric_1.default();
        scatterPoint.name = this.getTooltipDescription(metrics);
        switch (feature) {
            case "loudness":
                scatterPoint.value = metrics.loudness;
                this.loudness.push(scatterPoint);
                break;
            case "valence":
                scatterPoint.value = metrics.valence;
                this.valence.push(scatterPoint);
                break;
            case "acousticness":
                scatterPoint.value = metrics.acousticness;
                this.acousticness.push(scatterPoint);
                break;
            case "danceability":
                scatterPoint.value = metrics.danceability;
                this.danceability.push(scatterPoint);
                break;
            case "energy":
                scatterPoint.value = metrics.energy;
                this.energy.push(scatterPoint);
                break;
            case "instrumentalness":
                scatterPoint.value = metrics.instrumentalness;
                this.instrumentalness.push(scatterPoint);
                break;
            case "liveness":
                scatterPoint.value = metrics.liveness;
                this.liveness.push(scatterPoint);
                break;
            case "speechiness":
                scatterPoint.value = metrics.speechiness;
                this.speechiness.push(scatterPoint);
                break;
            case "tempo":
                scatterPoint.value = metrics.tempo;
                this.tempo.push(scatterPoint);
                break;
        }
    }
    getTooltipDescription(metrics) {
        const artistName = this.getDisplayFor(metrics.artist_name);
        return artistName ? `${metrics.song_name} - ${artistName}` : metrics.song_name;
    }
    getDisplayFor(val) {
        val = val ? val.trim() : val;
        if (val && val.length > 50) {
            return val.substring(0, 50) + "...";
        }
        return val;
    }
}
exports.default = MusicScatterData;
//# sourceMappingURL=MusicScatterData.js.map