import { get } from 'axios';
import { csvParse } from 'd3-dsv';

/**
 * Fetch CSV file content from /public/data
 * @param {String} fileNameCsv file name + file extention
 * @returns {Promise}
 * @exemple
 * ```
 * fetchData('file.csv')
 * ```
 */

export function fetchDataCsv (fileNameCsv) {
    return new Promise((success, failure) => {
        get('data/' + fileNameCsv, {
            // onDownloadProgress: e => console.log(e, e.loaded, e.total)
        })
        .then(({ data: str }) => {
            try {
                const csv = csvParse(str);
                success(csv);
            } catch (error) {
                failure(error);
            }
        })
        .catch((error) => {
            failure(error);
        })
    })
}