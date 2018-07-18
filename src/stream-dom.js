export class Node {
    constructor (tagName, attrs = {}, parent = null, ...children) {
        this.tagName = tagName
        this.attrs = attrs
        this.parent = parent
        this.children = children
    }
}

export default class StreamDom {
    currentNode = new Node('root')
    openTag (tagName, attrs) {
        const newNode = new Node(tagName, attrs, this.currentNode)
        this.currentNode.children.push(newNode)
        this.currentNode = newNode
    }
    closeTag () {
        this.currentNode = this.currentNode.parent
    }
    appendText (text) {
        this.currentNode.children.push(text)
    }
}
