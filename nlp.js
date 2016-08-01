
/**
 * Module constants
 */

var ENTITIES_REGEX = /(^|\s|;|\.|,|:)(audio|sound|🔊|panorama|🌅|image|picture|text|📝|videosphere|🎥|video|seconds|second|⏲|voiceover|📢|chart|📊|background|model)(\s|$|;|\.|,|:)/gi;
var LOCATION_REGEX = /right|left|behind|front/i;
var SIZE_REGEX = /tiny|small|large|huge/i;


module.exports = function (str) {
  return str
  .split('\n')
  .filter(function (p) { return  /[0-9]+ (⏲|seconds?)/.test(p) })
  .map(getObjects);
}

function getObjects(p) {
  var entities = [], entity;

  // Iterate over the paragraph and extract entities
  while((entity = ENTITIES_REGEX.exec(p)) !== null) {
    entities.push({ type: entity[2].trim(), index: entity.index });
  }

  // Extract attributes for each entity
  return entities.map(function(entity, i){

    // for backwards words I'm going back to the previous entity and add the length
    var sp = i !== 0 ?
      p.substring(entities[i - 1].index + entities[i - 1].type.length, entities[i].index + entities[i].type.length + 1) :
      p.substring(0, entities[i].index + entities[i].type.length + 1);

    // special case for duration
    if(entity.type === 'seconds' || entity.type === 'second' || entity.type === '⏲') {
      var match = sp.match(/[0-9]+ (⏲|seconds?)/)
      if(!match) return false;

      return {
        type: 'duration',
        value: parseInt(match[0].replace(/(⏲|seconds?)/, ''), 10)
      }
    } else if (entity.type === 'background') {
      var match = sp.match(/(#[a-fA-F0-9]{3,6}|\w+) background/i)
      return {
        type: 'background',
        color: match[0].replace(' background', '')
      }
    }

    // Get the portion of the text relative to this entity
    sp = i === entities.length - 1 ? p.substring(entity.index) : p.substring(entity.index, entities[i+1].index + 1);

    var str = sp
    switch(entity.type) {
      case 'audio':
      case 'sound':
      case '🔊':
        return {
          type: 'audio',
          src: getUrl(str),
          position: getPosition(str)
        }
      case 'voiceover':
      case '📢':
        return {
          type: 'voiceover',
          text: getQuote(str)
        };
      case 'chart':
      case '📊':
        return {
          type: 'chart',
          src: getUrl(str),
          position: getPosition(str, 10, 10),
          rotation: getRotation(str),
          scale: getSize(str)
        };
      case 'panorama':
      case '🌅':
      return {
        type: 'panorama',
        src: getUrl(str)
      }
      case 'video':
      return {
        type: 'video',
        src: getUrl(str),
        position: getPosition(str),
        scale: getSize(str),
        rotation: getRotation(str)
      }
      case 'videosphere':
      case '🎥':
      return {
        type: 'videosphere',
        src: getUrl(str)
      }
      case 'image':
      case 'picture':
      return {
        type: 'image',
        src: getUrl(str),
        position: getPosition(str),
        scale: getSize(str),
        rotation: getRotation(str)
      }
      case 'text':
      case '📝':
      var text = getQuote(str);
      return {
        type: 'text',
        text: text,
        position: getPosition(str, 14, text.length / 30),
        scale: getSize(str).map(function(el){ return el * 5; }),
        rotation: getRotation(str)
      }
      case 'model':
      return {
        type: 'model',
        src: getUrl(str),
        position: getPosition(str),
        scale: getSize(str),
        rotation: getRotation(str)
      }
    }

    return entity;
  })
  .filter(function(entity) { return !!entity; });
}

function getUrl(str) {
  var match = str.match(/https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)
  if(!match.length) return
  return match[0].toLowerCase()
}

function getQuote(str) {
  var match = str.match(/".*"/)
  if(!(match && match.length)) return
  return match[0].replace(/"/g, '')
}

function getPosition(str, width, height) {
  width = width || 0;
  height = height || 0;
  var match = str.match(LOCATION_REGEX)
  return getAbsPos(match && match.length ? match[0] : 'front', width, height)
}

function getSize(str) {
  var match = str.match(SIZE_REGEX)
  return getAbsSize(match && match.length ? match[0] : 'normal')
}

function getAbsPos(str, width, height) {
  var xSize = -.5 * width;
  var ySize = -.5 * height;
  switch(str) {
    case 'left':
      return [-5, 1.5 + ySize, 5 - xSize]
    case 'right':
      return [5, 1.5 + ySize, 5 + xSize]
    case 'behind':
      return [-xSize, 1.5 + ySize, 8]
    case 'front':
      return [0 + xSize, 1.5 + ySize, 0]
  }
}

function getRotation(str) {
  var match = str.match(LOCATION_REGEX);
  var pos = match && match.length ? match[0] : 'front';
  switch(pos) {
    case 'left':
      return [0, 90, 0]
    case 'right':
      return [0, -90, 0]
    case 'behind':
      return [0, 180, 0]
    case 'front':
      return [0, 0, 0]
    default:
      return [0, 0, 0]
  }
}

function getAbsSize(str) {
  switch(str) {
    case 'tiny':
      return [1/3, 1/3, 1/3]
    case 'small':
      return [1/2, 1/2, 1/2]
    case 'large':
      return [2, 2, 2]
    case 'huge':
      return [3, 3, 3]
    default:
      return [1, 1, 1]
  }
}
