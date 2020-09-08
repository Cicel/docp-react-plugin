import joinPath from 'memory-fs/lib/join';

/**
 * memfs添加join方法
 * @param {fs} fs
 */
export const ensureWebpackMemoryFs = (fs) => {
  // Return it back, when it has Webpack 'join' method
  if (fs.join) {
    return fs;
  }

  // Create FS proxy, adding `join` method to memfs, but not modifying original object
  const nextFs = Object.create(fs);
  nextFs.join = joinPath;

  return nextFs;
};
