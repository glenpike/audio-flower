const globby = require('globby');
const path = require('path');

let allSampleFiles;

const loadSamples = async dir => {
  const directorySamples = await globby([dir]);

  allSampleFiles = directorySamples.reduce((set, sampleFile) => {
    const matches = sampleFile.match(/\.\.\/samples\/([^\/]+)\/([^\/]+)\/(.+)$/);
    if (!matches) {
      console.log(`file doesn\'t match structure ${sampleFile}`);
    } else {
      const [, person, type, file ] = matches;
      if (!set[person]) {
        set[person] = {};
      }
      if (!set[person][type]) {
        set[person][type] = [];
      }
      set[person][type].push(path.resolve(dir, sampleFile));
    }
    return set;
  }, {})
  return allSampleFiles;
};

const getSampleFilesForPerson = person =>
  allSampleFiles[person.toUpperCase()] || {};

const getSampleFilesForType = type =>
  Object.keys(allSampleFiles).reduce(set, person => {
    const samples = allSampleFiles[person][type.toUpperCase()] || [];
    set = set.concat(samples);
  }, []);


const SHORT_SAMPLES_KEY = 'HITZ';
const QUOTES_KEY = 'QUOTES';
const LONG_SAMPLES_KEY = 'LONG';

const getSampleTypeForPerson = (person, type) => {
  const { [type.toUpperCase()]: samples = {} } = allSampleFiles[person.toUpperCase()];
  return Object.values(samples);
}

const getHitzForPerson = person => {
  return getSampleTypeForPerson(person, SHORT_SAMPLES_KEY);
}

const getQuotesForPerson = person => {
  return getSampleTypeForPerson(person, QUOTES_KEY);
};

const getLongSamplesForPerson = person => {
  return getSampleTypeForPerson(person, LONG_SAMPLES_KEY);
}

module.exports = {
  loadSamples,
  getSampleFilesForPerson,
  getSampleFilesForType,
  getHitzForPerson,
  getQuotesForPerson,
  getLongSamplesForPerson
};