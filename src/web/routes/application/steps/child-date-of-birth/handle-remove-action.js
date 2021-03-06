const { removeChildByIndex } = require('./remove-child-by-index')
const { PATH, REMOVE_CHILD_INDEX_KEY } = require('./constants')

const removeActionRequested = body => body.hasOwnProperty(REMOVE_CHILD_INDEX_KEY)

const decrementInputCount = childCount => childCount === 1 ? 1 : childCount - 1

const handleRemoveAction = (req, res, next) => {
  if (!removeActionRequested(req.body)) {
    return next()
  }

  const { childCount } = req.session.children
  const index = req.body[REMOVE_CHILD_INDEX_KEY]

  if (index <= 0) {
    throw new Error(`Unable to remove index ${index}`)
  }

  req.session.children = removeChildByIndex(req.session.children, index)
  req.session.children.inputCount = decrementInputCount(childCount)
  req.session.children.childCount = childCount - 1
  return res.redirect(PATH)
}

module.exports = {
  handleRemoveAction
}
