const chokidar = require('chokidar');
const config = require('config');
import SysTray from 'systray'

const FS_ROOT = config.get("Application.FS_ROOT");

const systray = new SysTray({
    menu: {
        // you should using .png icon in macOS/Linux, but .ico format in windows
        icon: "<base64 image string>",
        title: "Evemore Datastore",
        tooltip: "Evemore Datastore",
        items: [{
            title: "aa",
            tooltip: "bb",
            // checked is implement by plain text in linux
            checked: true,
            enabled: true
        }, {
            title: "aa2",
            tooltip: "bb",
            checked: false,
            enabled: true
        }, {
            title: "Exit",
            tooltip: "Shutdown Evemore Datastore",
            checked: false,
            enabled: true
        }]
    },
    debug: false,
    copyDir: true, // copy go tray binary to outside directory, useful for packing tool like pkg.
})

systray.onClick(action => {
if (action.seq_id === 0) {
    systray.sendAction({
        type: 'update-item',
        item: {
        ...action.item,
        checked: !action.item.checked,
        },
        seq_id: action.seq_id,
    })
} else if (action.seq_id === 1) {
    // open the url
    console.log('open the url', action)
} else if (action.seq_id === 2) {
    systray.kill()
}
})

// One-liner for current directory
chokidar.watch(FS_ROOT).on('all', (event, path) => {
  console.log(event, path);
});



