/*
 * This file is responsible for performing the logic of replacing
 * all occurrences of epoch strings to datetime strings.
 */
import optionsStorage from './options-storage';

const re_second = new RegExp('(\\D{1}|^)[1-2]\\d{9}(\\D{1}|$)', 'gi');
const re_milli = new RegExp('(\\D{1}|^)[1-2]\\d{12}(\\D{1}|$)', 'gi');
const re_micro = new RegExp('(\\D{1}|^)[1-2]\\d{15}(\\D{1}|$)', 'gi');
const re_nano = new RegExp('(\\D{1}|^)[1-2]\\d{18}(\\D{1}|$)', 'gi');
var epochtimestr;
var re;

/**
 * Substitutes datetimes into text nodes.
 * If the node contains more than just text (ex: it has child nodes),
 * call replaceText() on each of its children.
 *
 * @param  {Node} node    - The target DOM Node.
 * @return {void}         - Note: the substitution is done inline.
 */
function replaceText(node, ISOFORMAT, re_list) {
  // Setting textContent on a node removes all of its children and replaces
  // them with a single text node. Since we don't want to alter the DOM aside
  // from substituting text, we only substitute on single text nodes.
  // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
  if (node.nodeType === Node.TEXT_NODE) {
    // This node only contains text.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.

    // Skip textarea nodes due to the potential for accidental submission
    // of substituted text where none was intended.
    if (node.parentNode &&
      node.parentNode.nodeName === 'TEXTAREA') {
      return;
    }

    // Because DOM manipulation is slow, we don't want to keep setting
    // textContent after every replacement. Instead, manipulate a copy of
    // this string outside of the DOM and then perform the manipulation
    // once, at the end.
    let content = node.textContent;
    // if (content === "text") {
    //   node.textContent = "asd"
    // }
    for (let i = 0; i < re_list.length; i = i + 2) {
      re = re_list[i];
      do {
        epochtimestr = re.exec(content);
        if (epochtimestr) {
          epochtimestr = epochtimestr[0].replace(/\D/g, '');
          // console.log(epochtimestr)
          var epochtime = Number(epochtimestr) * re_list[i + 1]
          // console.log(epochtime)
          var datetime = new Date(epochtime)
          // console.log(datetime.toLocaleString())
          if (ISOFORMAT) {
            content = content.replace(epochtimestr, datetime.toISOString());
          }
          else {
            content = content.replace(epochtimestr, datetime.toLocaleString());
          }
          // console.log(content)
        }
      } while (epochtimestr);
    }

    // Now that all the replacements are done, perform the DOM manipulation.
    node.textContent = content;
  }
  else {
    // This node contains more than just text, call replaceText() on each
    // of its children.
    for (let i = 0; i < node.childNodes.length; i++) {
      replaceText(node.childNodes[i], ISOFORMAT, re_list);
    }
  }
}

async function main() {
  const options = await optionsStorage.getAll();
  if (!options.ENABLE) {
    return
  }
  var re_list = [];
  console.log(options.SECONDS);
  if (options.SECONDS) {
    re_list.push(re_second);
    re_list.push(1000)
  }
  console.log(options.MILLI);
  if (options.MILLI) {
    re_list.push(re_milli);
    re_list.push(1)
  }
  console.log(options.MICRO);
  if (options.MICRO) {
    re_list.push(re_micro);
    re_list.push(0.001)
  }
  console.log(options.NANO);
  if (options.NANO) {
    re_list.push(re_nano);
    re_list.push(0.000001)
  }

  // Start the recursion from the body tag.
  replaceText(document.body, options.ISOFORMAT, re_list);

  // Now monitor the DOM for additions and substitute emoji into new nodes.
  // @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        // This DOM change was new nodes being added. Run our substitution
        // algorithm on each newly added node.
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const newNode = mutation.addedNodes[i];
          replaceText(newNode, options.ISOFORMAT, re_list);
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

main();