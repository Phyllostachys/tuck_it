let gTabs;

function month_str(date) {
    return date.getFullYear().toString().slice(2, 4)
           + "."
           + ("00" + (date.getMonth() + 1).toString()).slice(-2);
}

function entry_prefix(date) {
    return date.getDate().toString()
           + "."
           + ("00" + date.getHours().toString()).slice(-2)
           + ":"
           + ("00" + date.getMinutes().toString()).slice(-2);
}

function add_tabs(node, date) {
    //console.log("add_tabs");
    //console.log(node);
    let prefix = entry_prefix(date);
    let promiseList = [];
    let counter = 0;
    for (let tab of gTabs) {
        if (gTabs.length == 1) {
            promiseList.push(browser.bookmarks.create({
                parentId: node.id,
                title: prefix + " " + tab.title, url: tab.url
            }));
        } else {
            promiseList.push(browser.bookmarks.create({
                parentId: node.id,
                title: prefix + " " + counter.toString() + " " + tab.title, url: tab.url
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
    //console.log(lks_results);

    let lks_node;
    let month_node;
    if (lks_results.length == 0) {
        // Need to create the folder structure
        lks_node = await browser.bookmarks.create({parentId: "toolbar_____", title: "lks"});
        month_node = await browser.bookmarks.create({parentId: lks_node.id, title: month_str(date)});
    } else {
        //console.log(lks_results[0]);
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
