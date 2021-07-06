"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParquetDataProvider = void 0;
const fs = require("fs");
const parquets_1 = require("parquets");
const config = require("../config");
const fileUtils = require("../utils/file.utils");
const logger_1 = require("../logger");
/**
 * Parquet data provider.
 */
class ParquetDataProvider {
    /**
     * Creates data provider for Parquet data files.
     * @see https://github.com/apache/parquet-format for more info.
     */
    constructor() {
        // TODO: add mime types later for http data loading
        this.supportedDataFileTypes = ['.parq', '.parquet'];
        // local Arrow data view schema cache with dataUrl/schema key/mapping entries
        this.dataSchemaMap = {};
        this.logger = new logger_1.Logger('parquet.data.provider:', config.logLevel);
        this.logger.debug('created for:', this.supportedDataFileTypes);
    }
    /**
     * Gets local or remote binary Arrow file data.
     * @param dataUrl Local data file path or remote data url.
     * @param parseOptions Data parse options.
     * @param loadData Load data callback.
     */
    getData(dataUrl, parseOptions, loadData) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataFileType = dataUrl.substr(dataUrl.lastIndexOf('.')); // file extension
            // read parquet data
            let dataRows = [];
            let reader = yield parquets_1.ParquetReader.openFile(dataUrl);
            let cursor = reader.getCursor();
            let record = null;
            while (record = yield cursor.next()) {
                dataRows.push(record);
            }
            yield reader.close();
            // create parquet data.json for text data preview
            const jsonFilePath = dataUrl.replace(dataFileType, '.json');
            if (parseOptions.createJsonFiles && !fs.existsSync(jsonFilePath)) {
                fileUtils.createJsonFile(jsonFilePath, dataRows);
            }
            loadData(dataRows);
        });
    } // end of getData()
    /**
     * Gets data table names for data sources with multiple data sets.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataTableNames(dataUrl) {
        return []; // none for Arrow data for now
    }
    /**
     * Gets data schema in json format for file types that provide it.
     * @param dataUrl Local data file path or remote data url.
     */
    getDataSchema(dataUrl) {
        return this.dataSchemaMap[dataUrl];
    }
    /**
     * Saves parquet data.
     * @param filePath Local data file path.
     * @param fileData Raw data to save.
     * @param tableName Table name for data files with multiple tables support.
     * @param showData Show saved data callback.
     */
    saveData(filePath, fileData, tableName, showData) {
        fileData = Buffer.from(fileData);
        this.logger.debug('saveData(): arrow parquet data size in bytes:', fileData.byteLength.toLocaleString());
        if (fileData.length > 0) {
            // TODO: change this to async later
            fs.writeFile(filePath, fileData, (error) => showData(error));
        }
    }
}
exports.ParquetDataProvider = ParquetDataProvider;
//# sourceMappingURL=parquet.data.provider.js.map