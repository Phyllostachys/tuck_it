let gTabs;

function zero_pad_left(num, digits) {
    return ("0".repeat(digits) + num.toString()).slice(-1 * digits);
}

function month_str(date) {
    return date.getFullYear().toString().slice(2, 4)
           + "_"
           + zero_pad_left(date.getMonth() + 1, 2);
}

function entry_prefix(date) {
    return zero_pad_left(date.getDate(), 2)
           + "."
           + zero_pad_left(date.getHours(), 2)
           + ":"
           + zero_pad_left(date.getMinutes(), 2);
}

function add_tabs(node, date) {
    let prefix = entry_prefix(date);
    let promiseList = [];
    let counter = 1;
    for (let tab of gTabs) {
        if (gTabs.length == 1) {
            promiseList.push(browser.bookmarks.create({
                parentId: node.id,
                title: prefix + " " + tab.title, url: tab.url
            }));
        } else {
            let count_str = zero_pad_left(counter, gTabs.length.toString().length);
            promiseList.push(browser.bookmarks.create({
                parentId: node.id,
                title: prefix
                       + " "
                       + (gTabs.length > 9 ? count_str : count_str.slice(-1))
                       + " "
                       + tab.title,
                url: tab.url
            }));
            counter++;
        }
    }
    return Promise.all(promiseList);
}

function error_print(error) {
    console.log(`An error: ${error}`);
}

async function print_tabs(tabs) {
    gTabs = tabs;
    let date = new Date();

    let lks_results = await browser.bookmarks.search("lks");

    let lks_node;
    let month_node;
    if (lks_results.length == 0) {
        // Need to create the folder structure
        lks_node = await browser.bookmarks.create({parentId: "toolbar_____", title: "lks"});
        month_node = await browser.bookmarks.create({parentId: lks_node.id, title: month_str(date)});
    } else {
        lks_node = lks_results[0];
        let month_result = await browser.bookmarks.search(month_str(date));
        if (month_result == 0) {
            // create month folder
            month_node = await browser.bookmarks.create({parentId: lks_node.id, title: month_str(date)});
        } else {
            month_node = month_result[0];
        }
    }

    add_tabs(month_node, date).catch(error_print);
}

function tuck_it_action() {
    function onError(error) {
        console.log(`Error: ${error}`);
    }

    browser.tabs.query({currentWindow: true}).then(print_tabs, onError);
}

browser.browserAction.onClicked.addListener(tuck_it_action);
