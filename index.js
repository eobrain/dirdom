import fs from 'fs'
import jsdom from 'jsdom'
import passprint from 'passprint'
const { JSDOM } = jsdom
const { pp } = passprint

class RootDoc {
  createElement (tagName) {
    switch (tagName) {
      case 'DIRECTORY':
        return new DirectoryElement(this)
      case 'FILE':
        return new FileElement(this)
      case 'HTML': {
        const dom = new JSDOM('<!DOCTYPE html>')
        const { document } = dom.window
        const result = document.querySelector('body')
        result.serialize = () => dom.serialize()
        return result
      }
      default:
        throw new Error(
            `Invalid tag ${tagName}. Valid tags are DIRECTORY, FILE, or HTML`)
    }
  }
}

class FsElement {
  constructor (doc) {
    this.doc = doc
  }

  get ownerDocument () {
    return this.doc
  }

  setAttribute (name, value) {
    switch (name) {
      case 'name':
        this._name = value
        break
      default:
        throw new Error(
                  `Invalid attribute "${name}". Only "name" is allowed for directories.`)
    }
  }

  _appendSelf (parent) {
    this._path = parent._path + '/' + this._name
  }
}

class DirectoryElement extends FsElement {
  appendChild (aChild) {
    aChild._appendSelf(this)
  }

  _appendSelf (parent) {
    if (!this._name) {
      throw new Error('Cannot append a file that does not have the "name" attribute set.')
    }
    super._appendSelf(parent)
    fs.mkdirSync(this._path)
  }
}

class FileElement extends FsElement {
  appendChild (aChild) {
    if (!this._name) {
      throw new Error('Cannot to a file that does not have the "name" attribute set.')
    }
    fs.writeFileSync(this._path + '.html', aChild.serialize(), 'utf8')
  }
}

export const root = path => {
  const result = new RootDoc().createElement('DIRECTORY')
  result._path = path
  return result
}
