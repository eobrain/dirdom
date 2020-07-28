import test from 'ava'
import tmp from 'tmp'
import fs from 'fs'
import { root } from '../index.js'
// import passprint from 'passprint'
// const { pp } = passprint

const { stat, readFile, unlink, rmdir } = fs.promises

test('basic', async t => {
  const tmpDir = tmp.dirSync()
  const rootElement = root(tmpDir.name)

  const dirElement = rootElement.ownerDocument.createElement('DIRECTORY')
  dirElement.setAttribute('name', 'foo')
  rootElement.appendChild(dirElement)

  const fileElement = dirElement.ownerDocument.createElement('FILE')
  fileElement.setAttribute('name', 'bar')
  dirElement.appendChild(fileElement)

  const htmlElement = fileElement.ownerDocument.createElement('HTML')

  const pElement = htmlElement.ownerDocument.createElement('p')
  pElement.textContent = 'Hello world!'
  htmlElement.appendChild(pElement)

  fileElement.appendChild(htmlElement)

  t.assert((await stat(tmpDir.name + '/foo')).isDirectory())
  t.assert((await stat(tmpDir.name + '/foo/bar.html')).isFile())
  const html = await readFile(tmpDir.name + '/foo/bar.html', 'utf8')
  t.deepEqual(html, '<!DOCTYPE html><html><head></head><body><p>Hello world!</p></body></html>')

  await unlink(tmpDir.name + '/foo/bar.html')
  await rmdir(tmpDir.name + '/foo')
  tmpDir.removeCallback()
})
