import through2 from 'through2';
import fs2 from 'docp/lib/fs2';
import docpConfig from 'docp/lib/model/docp-config';
import webpack from 'webpack';
import { ensureWebpackMemoryFs } from './utils';
import util from 'util';
import path from 'path';

const webpackConfig = require('../webpack.config')
const scripts = ['https://cdn.bootcdn.net/ajax/libs/react/16.13.1/umd/react.development.js', 'https://cdn.bootcdn.net/ajax/libs/react-dom/16.13.1/umd/react-dom.development.js']
export default function (options) {
  const pages: any = new Map()
  webpackConfig.entry = {};
  return through2.obj(function (obj, enc, callback) {
    const { page, execCode = {} } = obj;
    const { type, containerId, value } = execCode;
    if (!page || !type || type !== 'react') {
      this.push(obj);
      return callback();
    }
    const filePath = path.resolve(docpConfig.virtualDir, containerId) + '.jsx'
    fs2.writeFileSync(filePath, value)
    // magic separator
    webpackConfig.entry[page.contentFile.stem + '|' + containerId] = filePath

    page.addExternalScripts(scripts)
    pages.set(page.contentFile.stem, page)
    callback();
  }, async function (callback) {
    const result = await build(webpackConfig)
    for (const i in result) {
      const pageName = result[i].split('|')[0]
      const page = pages.get(pageName)
      const output = fs2.readFileSync('/dist/' + result[i]).toString()
      page.addInlineScripts(output)
      this.push(page.outputHTML());
    }
    callback();
  });
}

async function build(config) {
  // 判断entry是否为空
  if (Object.keys(webpackConfig.entry).length === 0) {
    return [];
  }
  const ufs2 = ensureWebpackMemoryFs(fs2);
  const compiler = webpack(webpackConfig);
  compiler.inputFileSystem = ufs2;
  compiler.outputFileSystem = ufs2;
  // run
  const run = util.promisify(compiler.run.bind(compiler));
  const stats = await run();
  const statsJSON = stats.toJson();
  if (statsJSON.errors.length > 0) {
    throw new Error(statsJSON.errors);
  }
  return statsJSON.assetsByChunkName;
}