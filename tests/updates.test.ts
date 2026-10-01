import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availableUpdate } from '../src/updates';

const release = {tag_name:'android-1020', assets:[{name:'truco.apk',browser_download_url:'https://github.com/Xaoxay/truco/releases/download/android-1020/truco.apk'}]};
test('offers only strictly newer installable builds from this repository', () => {
  assert.equal(availableUpdate(release, 1019)?.code, 1020);
  assert.equal(availableUpdate(release, 1020), null);
  assert.equal(availableUpdate(release, 1021), null);
  assert.equal(availableUpdate({...release, prerelease:true}, 1019), null);
  assert.equal(availableUpdate({...release, assets:[]}, 1019), null);
  assert.equal(availableUpdate({...release, assets:[{name:'truco.apk',browser_download_url:'https://example.com/fake.apk'}]}, 1019), null);
  assert.equal(availableUpdate(null, 1019), null);
});
