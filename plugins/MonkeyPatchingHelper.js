function patch(type, patches) {
  for(let key in patches) {
    let originalMethod = type.prototype[key];
    type.prototype[key] = patches[key].call(undefined, originalMethod);
  }
}

function extend(type, newMethods) {
  for(let key in newMethods)
    type.prototype[key] = newMethods[key];
}
