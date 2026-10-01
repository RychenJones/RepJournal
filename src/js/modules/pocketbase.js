import PocketBase from 'pocketbase';

const PB_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8090'
    : 'https://api.repjournal.rychenjones.com';

const pb = new PocketBase(PB_URL);

export default pb;
